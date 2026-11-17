const dataService = require('../services/dataService');

// @desc    Create a new food donation (Active or Draft)
// @route   POST /api/donations
// @access  Private (Donor, Admin)
const createDonation = async (req, res, next) => {
  try {
    const {
      foodName,
      description,
      category,
      dietaryType,
      quantity,
      quantityUnit,
      servings,
      cookedTime,
      expiryTime,
      pickupAddress,
      pickupCity,
      pinCode,
      pickupStartTime,
      pickupEndTime,
      pickupWindow,
      contactPhone,
      contactNumber,
      additionalInstructions,
      imageUrl,
      safetyCertified,
      storageInstruction,
      status,
    } = req.body;

    const isDraft = status === 'Draft';

    if (!isDraft) {
      if (!foodName || !quantity || !servings || !cookedTime || !expiryTime || !pickupAddress || !pickupCity) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all mandatory food and pickup details',
        });
      }

      if (!safetyCertified) {
        return res.status(400).json({
          success: false,
          message: 'You must certify that the food is fresh, safely stored, and hygienic',
        });
      }

      if (new Date(expiryTime) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Safe consumption deadline must be a future time',
        });
      }
    }

    const donation = await dataService.createDonation(
      {
        foodName: foodName || 'Draft Surplus Food',
        description: description || '',
        category: category || 'Cooked meals',
        dietaryType: dietaryType || 'Vegetarian',
        quantity: quantity || '1 batch',
        quantityUnit: quantityUnit || 'meals',
        servings: Number(servings) || 1,
        cookedTime: cookedTime ? new Date(cookedTime) : new Date(),
        expiryTime: expiryTime ? new Date(expiryTime) : new Date(Date.now() + 8 * 3600 * 1000),
        pickupAddress: pickupAddress || req.user.address || 'Address pending',
        pickupCity: pickupCity || req.user.city || 'Bengaluru',
        pinCode: pinCode || req.user.pinCode || '560001',
        pickupStartTime: pickupStartTime || pickupWindow?.from || '12:00',
        pickupEndTime: pickupEndTime || pickupWindow?.to || '18:00',
        pickupWindow: pickupWindow || {
          from: pickupStartTime || '12:00',
          to: pickupEndTime || '18:00',
        },
        contactPhone: contactNumber || contactPhone || req.user.phone,
        additionalInstructions: additionalInstructions || '',
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        safetyCertified: isDraft ? false : true,
        storageInstruction: storageInstruction || 'Room Temperature',
        status: isDraft ? 'Draft' : 'Available',
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: isDraft ? 'Donation saved as draft!' : 'Food donation posted successfully!',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all food donations with filtering & search
// @route   GET /api/donations
// @access  Public
const getDonations = async (req, res, next) => {
  try {
    const { search, category, dietaryType, city, status = 'Available', sortBy = 'urgency' } = req.query;

    const donations = await dataService.getDonations({
      search,
      category,
      dietaryType,
      city,
      status,
      sortBy,
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Public / Private
const getDonationById = async (req, res, next) => {
  try {
    const result = await dataService.getDonationById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Food donation listing not found',
      });
    }

    const { trackingLogs = [], requests = [], ...donationFields } = result;

    res.status(200).json({
      success: true,
      donation: donationFields,
      trackingLogs,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my-donations
// @access  Private (Donor, Admin)
const getMyDonations = async (req, res, next) => {
  try {
    const donations = await dataService.getMyDonations(req.user);

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update eligible donation
// @route   PUT /api/donations/:id
// @access  Private (Donor, Admin)
const updateDonation = async (req, res, next) => {
  try {
    const donation = await dataService.updateDonation(req.params.id, req.body, req.user);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel donation
// @route   PUT /api/donations/:id/cancel
// @access  Private (Donor, Admin)
const cancelDonation = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by donor' } = req.body;
    const donation = await dataService.cancelDonation(req.params.id, reason, req.user);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report listing
// @route   POST /api/donations/:id/report
// @access  Private
const reportDonation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for reporting' });
    }

    const donation = await dataService.reportDonation(req.params.id, reason, req.user);

    res.status(200).json({
      success: true,
      message: 'Report submitted. Our safety team will review this listing shortly.',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donation (Admin / Owner)
// @route   DELETE /api/donations/:id
// @access  Private (Donor, Admin)
const deleteDonation = async (req, res, next) => {
  try {
    await dataService.deleteDonation(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  updateDonation,
  cancelDonation,
  reportDonation,
  deleteDonation,
};
