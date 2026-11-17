const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');
const DonationRequest = require('../models/DonationRequest');
const TrackingLog = require('../models/TrackingLog');
const Notification = require('../models/Notification');

// ================= USER OPERATIONS =================

const findUserByEmail = async (email, includePassword = false) => {
  const q = User.findOne({ email: email.toLowerCase() });
  if (includePassword) q.select('+password');
  return await q.exec();
};

const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const updateUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true });
};

const getAllUsers = async ({ role, status, search }) => {
  const query = {};
  if (role && role !== 'all') query.role = role;
  if (status && status !== 'all') query.status = status;
  if (search && search.trim()) {
    const regex = { $regex: search.trim(), $options: 'i' };
    query.$or = [{ name: regex }, { email: regex }, { organizationName: regex }, { city: regex }];
  }
  return await User.find(query).sort({ createdAt: -1 });
};

// ================= DONATION OPERATIONS =================

const getDonations = async ({
  search,
  category,
  dietaryType,
  city,
  status = 'Available',
  sortBy = 'urgency',
}) => {
  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (dietaryType && dietaryType !== 'All') {
    query.dietaryType = dietaryType;
  }

  if (city && city.trim()) {
    query.pickupCity = { $regex: city.trim(), $options: 'i' };
  }

  if (search && search.trim()) {
    const regex = { $regex: search.trim(), $options: 'i' };
    query.$or = [{ foodName: regex }, { description: regex }, { pickupAddress: regex }, { pickupCity: regex }];
  }

  let sortOption = { expiryTime: 1 }; // Default urgency
  if (sortBy === 'newest') sortOption = { createdAt: -1 };
  if (sortBy === 'servings') sortOption = { servings: -1 };

  return await FoodDonation.find(query)
    .populate('donor', 'name organizationName phone email address city isVerified verificationStatus')
    .sort(sortOption);
};

const getDonationById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const donation = await FoodDonation.findById(id)
    .populate('donor', 'name organizationName phone email address city isVerified verificationStatus')
    .populate('assignedNgo', 'name organizationName phone email address city')
    .populate('acceptedRequest');

  if (!donation) return null;

  const trackingLogs = await TrackingLog.find({ donation: donation._id })
    .populate('updatedBy', 'name role organizationName')
    .sort({ timestamp: 1 });

  const requests = await DonationRequest.find({ donation: donation._id })
    .populate('ngo', 'name organizationName phone email city')
    .sort({ createdAt: -1 });

  return {
    ...donation.toObject(),
    trackingLogs,
    requests,
  };
};

const createDonation = async (data, user) => {
  const donation = await FoodDonation.create({
    donor: user._id,
    ...data,
    status: data.status || 'Available',
  });

  await TrackingLog.create({
    donation: donation._id,
    previousStatus: '',
    newStatus: donation.status,
    updatedBy: user._id,
    actorRole: user.role,
    title: 'Food Donation Listed',
    note: `Donation created by ${user.organizationName || user.name}. ${data.servings} servings available.`,
  });

  return donation;
};

const getMyDonations = async (user) => {
  const userId = user._id || user.id;

  const donations = await FoodDonation.find({ donor: userId })
    .populate('assignedNgo', 'name organizationName phone')
    .populate('acceptedRequest')
    .sort({ createdAt: -1 });

  const donationIds = donations.map((d) => d._id);
  const requests = await DonationRequest.find({ donation: { $in: donationIds } })
    .populate('ngo', 'name organizationName phone email city');

  return donations.map((d) => {
    const relRequests = requests.filter((r) => r.donation.toString() === d._id.toString());
    return {
      ...d.toObject(),
      requestsCount: relRequests.length,
      pendingRequestsCount: relRequests.filter((r) => r.status === 'Pending').length,
      requests: relRequests,
    };
  });
};

const updateDonation = async (id, updates, user) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) throw new Error('Donation not found');

  if (donation.donor.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new Error('Not authorized to update this donation');
  }

  // Only allow updating Available or Draft listings
  if (!['Available', 'Draft'].includes(donation.status) && user.role !== 'admin') {
    throw new Error('Cannot edit a donation that has already been accepted or picked up');
  }

  Object.assign(donation, updates);
  await donation.save();

  await TrackingLog.create({
    donation: donation._id,
    previousStatus: donation.status,
    newStatus: donation.status,
    updatedBy: user._id,
    actorRole: user.role,
    title: 'Donation Details Updated',
    note: `Updated listing by donor ${user.organizationName || user.name}.`,
  });

  return donation;
};

const cancelDonation = async (id, reason, user) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) throw new Error('Donation not found');

  if (donation.donor.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new Error('Not authorized to cancel this donation');
  }

  const prevStatus = donation.status;
  donation.status = 'Cancelled';
  await donation.save();

  // Reject all pending requests
  await DonationRequest.updateMany(
    { donation: donation._id, status: 'Pending' },
    { status: 'Cancelled', responseNote: `Donation cancelled by donor: ${reason || 'No longer available'}` }
  );

  await TrackingLog.create({
    donation: donation._id,
    previousStatus: prevStatus,
    newStatus: 'Cancelled',
    updatedBy: user._id,
    actorRole: user.role,
    title: 'Donation Cancelled',
    note: reason || 'Cancelled by donor kitchen.',
  });

  return donation;
};

const reportDonation = async (id, reason, user) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) throw new Error('Donation not found');

  donation.reportsCount = (donation.reportsCount || 0) + 1;
  donation.reportReason = reason || 'Safety or hygiene concern reported by community';
  await donation.save();

  return donation;
};

const resolveReport = async (id) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) throw new Error('Donation not found');

  donation.reportsCount = 0;
  donation.reportReason = '';
  await donation.save();

  return donation;
};

const deleteDonation = async (id, user) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) throw new Error('Donation not found');

  if (donation.donor.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new Error('Not authorized to delete this donation');
  }

  await FoodDonation.findByIdAndDelete(id);
  await DonationRequest.deleteMany({ donation: id });
  await TrackingLog.deleteMany({ donation: id });

  return { success: true };
};

// ================= REQUEST OPERATIONS =================

const createRequest = async (data, user) => {
  const {
    donationId,
    servingsRequested,
    requestedQuantity,
    pickupTime,
    proposedPickupTime,
    volunteerName,
    volunteerPhone,
    vehicleNumber,
    message,
    beneficiaries,
  } = data;

  const donation = await FoodDonation.findById(donationId).populate('donor');
  if (!donation) throw new Error('Donation listing not found');

  if (donation.status !== 'Available') {
    throw new Error(`This donation is no longer available (current status: ${donation.status})`);
  }

  // Prevent duplicate pending requests from same NGO
  const existingReq = await DonationRequest.findOne({
    donation: donation._id,
    ngo: user._id,
    status: { $in: ['Pending', 'Accepted'] },
  });

  if (existingReq) {
    throw new Error('You already have an active request for this food donation');
  }

  const requestedAmount = Number(requestedQuantity || servingsRequested) || 1;

  const request = await DonationRequest.create({
    donation: donation._id,
    donor: donation.donor._id,
    ngo: user._id,
    requestedQuantity: requestedAmount,
    servingsRequested: requestedAmount,
    beneficiaries: Number(beneficiaries) || requestedAmount,
    pickupTime: pickupTime || proposedPickupTime,
    proposedPickupTime: pickupTime || proposedPickupTime,
    volunteerName,
    volunteerPhone,
    vehicleNumber: vehicleNumber || '',
    message: message || '',
    status: 'Pending',
  });

  // Log in tracking
  await TrackingLog.create({
    donation: donation._id,
    previousStatus: donation.status,
    newStatus: 'Requested',
    updatedBy: user._id,
    actorRole: user.role,
    title: 'NGO Request Submitted',
    note: `${user.organizationName || user.name} requested ${requestedAmount} servings for ${beneficiaries || requestedAmount} beneficiaries.`,
  });

  // Create in-app notification for donor
  try {
    await Notification.create({
      userId: donation.donor._id,
      title: 'New Food Donation Request',
      message: `${user.organizationName || user.name} requested ${requestedAmount} servings of "${donation.foodName}".`,
      type: 'request_received',
      link: '/donor/dashboard',
    });
  } catch (err) {
    console.warn('[Notification Error]', err.message);
  }

  return request;
};

const respondToRequest = async (requestId, action, responseNote, user) => {
  const request = await DonationRequest.findById(requestId)
    .populate('donation')
    .populate('ngo', 'name organizationName phone email')
    .populate('donor', 'name organizationName phone');

  if (!request) throw new Error('Request not found');
  if (request.donor._id.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new Error('Not authorized to respond to this request');
  }
  if (request.status !== 'Pending') {
    throw new Error(`This request is already ${request.status.toLowerCase()}`);
  }

  const donation = await FoodDonation.findById(request.donation._id);

  if (action === 'accept') {
    request.status = 'Accepted';
    request.responseNote = responseNote || 'Accepted by donor kitchen. Please arrive on time.';
    await request.save();

    donation.status = 'Accepted';
    donation.assignedNgo = request.ngo._id;
    donation.acceptedRequest = request._id;
    await donation.save();

    // Auto reject other pending requests
    await DonationRequest.updateMany(
      { donation: donation._id, _id: { $ne: request._id }, status: 'Pending' },
      { status: 'Rejected', responseNote: 'Another organization was matched for this batch.' }
    );

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: 'Requested',
      newStatus: 'Accepted',
      updatedBy: user._id,
      actorRole: user.role,
      title: 'Donation Accepted',
      note: `Approved request for ${request.ngo.organizationName || request.ngo.name}. Verification OTP: ${request.verificationOtp}`,
    });

    // Notify NGO
    try {
      await Notification.create({
        userId: request.ngo._id,
        title: 'Food Request Accepted!',
        message: `Your request for "${donation.foodName}" was accepted by ${user.organizationName || user.name}. Verification OTP: ${request.verificationOtp}`,
        type: 'request_accepted',
        link: '/ngo/dashboard',
      });
    } catch (err) {
      console.warn('[Notification Error]', err.message);
    }

    return request;
  } else {
    request.status = 'Rejected';
    request.responseNote = responseNote || 'Declined by donor';
    await request.save();

    const pendingCount = await DonationRequest.countDocuments({ donation: donation._id, status: 'Pending' });
    if (pendingCount === 0) {
      donation.status = 'Available';
      await donation.save();
    }

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: donation.status,
      newStatus: donation.status,
      updatedBy: user._id,
      actorRole: user.role,
      title: 'Request Declined',
      note: `Donor declined request from ${request.ngo.organizationName || request.ngo.name}.`,
    });

    // Notify NGO
    try {
      await Notification.create({
        userId: request.ngo._id,
        title: 'Food Request Declined',
        message: `Your request for "${donation.foodName}" was declined by ${user.organizationName || user.name}.`,
        type: 'request_rejected',
        link: '/ngo/dashboard',
      });
    } catch (err) {
      console.warn('[Notification Error]', err.message);
    }

    return request;
  }
};

const updateLifecycleStatus = async (requestId, status, note, otp, user) => {
  const userId = user._id || user.id;

  const request = await DonationRequest.findById(requestId)
    .populate('donation')
    .populate('ngo', 'name organizationName phone email')
    .populate('donor', 'name organizationName phone email');

  if (!request) throw new Error('Request not found');

  const isNgo = request.ngo._id.toString() === userId.toString();
  const isDonor = request.donor._id.toString() === userId.toString();
  const isAdmin = user.role === 'admin';

  if (!isNgo && !isDonor && !isAdmin) {
    throw new Error('Not authorized to update status of this request');
  }

  const donation = await FoodDonation.findById(request.donation._id);

  if (status === 'Ready for Pickup') {
    if (!isDonor && !isAdmin) throw new Error('Only the donor can mark food as Ready for Pickup');
    request.status = 'Ready for Pickup';
    await request.save();

    donation.status = 'Ready for Pickup';
    await donation.save();

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: 'Accepted',
      newStatus: 'Ready for Pickup',
      updatedBy: user._id,
      actorRole: user.role,
      title: 'Food Ready for Pickup',
      note: note || 'Food is packaged and ready at the donor venue.',
    });

    try {
      await Notification.create({
        userId: request.ngo._id,
        title: 'Food Ready for Pickup!',
        message: `"${donation.foodName}" is packed and ready for pickup at ${donation.pickupAddress}.`,
        type: 'pickup_ready',
        link: '/ngo/dashboard',
      });
    } catch (err) {
      console.warn('[Notification Error]', err.message);
    }

    return request;
  }

  if (status === 'Picked Up') {
    if (!['Accepted', 'Ready for Pickup'].includes(request.status)) {
      throw new Error('Can only mark Picked Up after donation is Accepted or Ready for Pickup');
    }

    if (otp && otp.trim() !== request.verificationOtp) {
      throw new Error('Invalid 4-digit verification OTP. Please verify with the donor.');
    }

    request.status = 'Picked Up';
    await request.save();

    donation.status = 'Picked Up';
    await donation.save();

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: donation.status,
      newStatus: 'Picked Up',
      updatedBy: user._id,
      actorRole: user.role,
      title: 'Food Collected by Volunteer',
      note: note || `Volunteer ${request.volunteerName} collected food. In transit to shelter.`,
    });

    try {
      await Notification.create({
        userId: request.donor._id,
        title: 'Food Picked Up',
        message: `${request.ngo.organizationName || request.ngo.name} volunteer ${request.volunteerName} collected "${donation.foodName}".`,
        type: 'pickup_ready',
        link: '/donor/dashboard',
      });
    } catch (err) {
      console.warn('[Notification Error]', err.message);
    }

    return request;
  }

  if (status === 'Delivered' || status === 'Completed') {
    if (request.status !== 'Picked Up' && !isAdmin) {
      throw new Error('Can only complete delivery after food is Picked Up');
    }

    request.status = 'Delivered';
    await request.save();

    donation.status = 'Delivered';
    await donation.save();

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: 'Picked Up',
      newStatus: 'Completed',
      updatedBy: user._id,
      actorRole: user.role,
      title: 'Meals Delivered & Distributed',
      note: note || `Surplus food safely served to ${request.beneficiaries || request.servingsRequested} beneficiaries.`,
    });

    try {
      await Notification.create({
        userId: request.donor._id,
        title: 'Donation Completed & Impact Recorded!',
        message: `Your donation of "${donation.foodName}" was safely distributed to people in need. Thank you!`,
        type: 'donation_completed',
        link: '/donor/dashboard',
      });

      await Notification.create({
        userId: request.ngo._id,
        title: 'Donation Completed',
        message: `Distribution of "${donation.foodName}" successfully logged.`,
        type: 'donation_completed',
        link: '/ngo/dashboard',
      });
    } catch (err) {
      console.warn('[Notification Error]', err.message);
    }

    return request;
  }

  if (status === 'Cancelled') {
    request.status = 'Cancelled';
    request.responseNote = note || 'Cancelled';
    await request.save();

    const pendingCount = await DonationRequest.countDocuments({ donation: donation._id, status: 'Pending' });
    donation.status = pendingCount > 0 ? 'Requested' : 'Available';
    donation.assignedNgo = null;
    donation.acceptedRequest = null;
    await donation.save();

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: 'Accepted',
      newStatus: donation.status,
      updatedBy: user._id,
      actorRole: user.role,
      title: 'Request Cancelled',
      note: note || 'Request was cancelled.',
    });

    return request;
  }

  throw new Error(`Unsupported lifecycle status: ${status}`);
};

const getMyRequests = async (user) => {
  const userId = user._id || user.id;

  return await DonationRequest.find({ ngo: userId })
    .populate({
      path: 'donation',
      populate: { path: 'donor', select: 'name organizationName phone email address city' },
    })
    .populate('donor', 'name organizationName phone email city')
    .sort({ createdAt: -1 });
};

// ================= PLATFORM STATS =================

const getPlatformStats = async () => {
  const totalDonors = await User.countDocuments({ role: 'donor' });
  const totalNgos = await User.countDocuments({ role: 'ngo' });
  const totalDonations = await FoodDonation.countDocuments();
  const availableDonations = await FoodDonation.countDocuments({ status: 'Available' });
  const inProgressDonations = await FoodDonation.countDocuments({
    status: { $in: ['Requested', 'Accepted', 'Ready for Pickup', 'Picked Up'] },
  });
  const deliveredDonations = await FoodDonation.countDocuments({
    status: { $in: ['Delivered', 'Completed'] },
  });

  const mealsOfferedAgg = await FoodDonation.aggregate([
    { $group: { _id: null, totalServings: { $sum: '$servings' } } },
  ]);
  const estimatedMealsOffered = mealsOfferedAgg[0]?.totalServings || 0;

  const mealsDeliveredAgg = await FoodDonation.aggregate([
    { $match: { status: { $in: ['Delivered', 'Completed'] } } },
    { $group: { _id: null, totalServings: { $sum: '$servings' } } },
  ]);
  const verifiedMealsDelivered = mealsDeliveredAgg[0]?.totalServings || 0;

  const estimatedKgFoodSaved = Math.round(verifiedMealsDelivered * 0.4);
  const estimatedCo2SavedKg = Math.round(estimatedKgFoodSaved * 1.9);

  const categoryStats = await FoodDonation.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, servings: { $sum: '$servings' } } },
    { $sort: { count: -1 } },
  ]);

  const categoryBreakdown = categoryStats.map((c) => ({
    category: c._id || 'Other',
    count: c.count,
    servings: c.servings,
  }));

  return {
    verified: {
      verifiedMealsDelivered,
      totalDonations,
      participatingDonors: totalDonors,
      participatingNgos: totalNgos,
      deliveredDonations,
    },
    operational: {
      availableDonations,
      inProgressDonations,
    },
    estimates: {
      estimatedMealsOffered,
      estimatedKgFoodSaved,
      estimatedCo2SavedKg,
    },
    categories: categoryBreakdown,
  };
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  getAllUsers,
  getDonations,
  getDonationById,
  createDonation,
  getMyDonations,
  updateDonation,
  cancelDonation,
  reportDonation,
  resolveReport,
  deleteDonation,
  createRequest,
  respondToRequest,
  updateLifecycleStatus,
  getMyRequests,
  getPlatformStats,
};
