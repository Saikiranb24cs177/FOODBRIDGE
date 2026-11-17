const User = require('../models/User');
const FoodDonation = require('../models/FoodDonation');
const DonationRequest = require('../models/DonationRequest');
const TrackingLog = require('../models/TrackingLog');
const Notification = require('../models/Notification');
const dataService = require('../services/dataService');

// @desc    Admin dashboard summary metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNgos = await User.countDocuments({ role: 'ngo' });
    const pendingVerifications = await User.countDocuments({ role: 'ngo', verificationStatus: 'pending' });

    const totalDonations = await FoodDonation.countDocuments();
    const availableDonations = await FoodDonation.countDocuments({ status: 'Available' });
    const completedDonations = await FoodDonation.countDocuments({ status: { $in: ['Delivered', 'Completed'] } });

    const totalRequests = await DonationRequest.countDocuments();
    const pendingRequests = await DonationRequest.countDocuments({ status: 'Pending' });

    const reportedDonations = await FoodDonation.countDocuments({ reportsCount: { $gt: 0 } });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalNgos,
        pendingVerifications,
        totalDonations,
        availableDonations,
        completedDonations,
        totalRequests,
        pendingRequests,
        reportedDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, verificationStatus } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (verificationStatus && verificationStatus !== 'all') query.verificationStatus = verificationStatus;

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: regex }, { email: regex }, { organizationName: regex }, { city: regex }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or unverify NGO organisation
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyUser = async (req, res, next) => {
  try {
    const { isVerified, verificationStatus, note } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const statusValue = verificationStatus || (isVerified ? 'verified' : 'rejected');
    user.verificationStatus = statusValue;
    user.isVerified = statusValue === 'verified';
    if (note) {
      user.verificationDetails = user.verificationDetails || {};
      user.verificationDetails.notes = note;
    }
    await user.save();

    // Create Notification for the user
    try {
      await Notification.create({
        userId: user._id,
        title: user.isVerified ? 'Organisation Verified!' : 'Organisation Verification Update',
        message: user.isVerified
          ? 'Congratulations! Your organization profile has been officially verified by FoodBridge.'
          : `Verification status updated: ${statusValue}. ${note || ''}`,
        type: 'verification_update',
        link: user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard',
      });
    } catch (err) {
      console.warn('Notification failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: `Organization marked as ${statusValue}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (active / suspended)
// @route   PUT /api/admin/users/:id/status or PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status, isVerified, verificationStatus } = req.body;
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (verificationStatus !== undefined) updates.verificationStatus = verificationStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations for admin review
// @route   GET /api/admin/donations
// @access  Private (Admin)
const getAllDonations = async (req, res, next) => {
  try {
    const { status, category, city, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'All') query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    if (city && city.trim()) query.pickupCity = { $regex: city.trim(), $options: 'i' };

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ foodName: regex }, { description: regex }, { pickupCity: regex }];
    }

    const donations = await FoodDonation.find(query)
      .populate('donor', 'name organizationName phone email city')
      .populate('assignedNgo', 'name organizationName phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reported food listings
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReportedDonations = async (req, res, next) => {
  try {
    const donations = await FoodDonation.find({ reportsCount: { $gt: 0 } })
      .populate('donor', 'name organizationName phone email')
      .sort({ reportsCount: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss or resolve report on donation
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.reportsCount = 0;
    donation.reportReason = '';
    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Report resolved and listing cleared.',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete / cancel donation
// @route   DELETE /api/admin/donations/:id
// @access  Private (Admin)
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    donation.status = 'Cancelled';
    await donation.save();

    await DonationRequest.updateMany(
      { donation: donation._id },
      { status: 'Cancelled', responseNote: 'Donation listing removed by administrator.' }
    );

    await TrackingLog.create({
      donation: donation._id,
      previousStatus: 'Available',
      newStatus: 'Cancelled',
      updatedBy: req.user._id,
      actorRole: 'admin',
      title: 'Listing Removed by Administrator',
      note: 'Listing violated safety standards or was deleted by platform admin.',
    });

    res.status(200).json({
      success: true,
      message: 'Listing removed by administrator.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donation requests for admin
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getAllRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const requests = await DonationRequest.find(query)
      .populate('donor', 'name organizationName phone email city')
      .populate('ngo', 'name organizationName phone email city verificationStatus')
      .populate('donation', 'foodName quantity unit category status pickupAddress pickupCity pickupDeadline')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  verifyUser,
  updateUserStatus,
  getAllDonations,
  getAllRequests,
  getReportedDonations,
  resolveReport,
  deleteDonation,
};
