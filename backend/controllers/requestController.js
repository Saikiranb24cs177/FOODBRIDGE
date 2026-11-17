const dataService = require('../services/dataService');

// @desc    NGO submits a request for a food donation
// @route   POST /api/requests
// @access  Private (NGO, Admin)
const createRequest = async (req, res, next) => {
  try {
    const {
      donationId,
      servingsRequested,
      requestedQuantity,
      proposedPickupTime,
      pickupTime,
      volunteerName,
      volunteerPhone,
      vehicleNumber,
      message,
      beneficiaries,
    } = req.body;

    const requestedAmount = requestedQuantity || servingsRequested;
    const time = pickupTime || proposedPickupTime;

    if (!donationId || !requestedAmount || !time || !volunteerName || !volunteerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including volunteer contact details and proposed pickup time',
      });
    }

    const request = await dataService.createRequest(
      {
        donationId,
        requestedQuantity: Number(requestedAmount),
        servingsRequested: Number(requestedAmount),
        pickupTime: time,
        proposedPickupTime: time,
        volunteerName,
        volunteerPhone,
        vehicleNumber,
        message,
        beneficiaries: Number(beneficiaries) || Number(requestedAmount),
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Request submitted to the donor successfully!',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor accepts or rejects an NGO's request
// @route   PUT /api/requests/:id/respond
// @access  Private (Donor, Admin)
const respondToRequest = async (req, res, next) => {
  try {
    const { action, responseNote } = req.body; // action: 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accept or reject' });
    }

    const request = await dataService.respondToRequest(req.params.id, action, responseNote, req.user);

    res.status(200).json({
      success: true,
      message: action === 'accept' ? 'Request accepted! NGO notified to proceed with pickup.' : 'Request declined.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery lifecycle: 'Ready for Pickup', 'Picked Up', 'Delivered', 'Completed', 'Cancelled'
// @route   PUT /api/requests/:id/status
// @access  Private (NGO, Donor, Admin)
const updateLifecycleStatus = async (req, res, next) => {
  try {
    const { status, note, otp } = req.body;

    const allowed = ['Ready for Pickup', 'Picked Up', 'Delivered', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status update. Allowed: ${allowed.join(', ')}`,
      });
    }

    const request = await dataService.updateLifecycleStatus(req.params.id, status, note, otp, req.user);

    res.status(200).json({
      success: true,
      message: `Status updated successfully to ${status}!`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests made by the logged-in NGO
// @route   GET /api/requests/my or GET /api/requests/my-requests
// @access  Private (NGO, Admin)
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await dataService.getMyRequests(req.user);

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
  createRequest,
  respondToRequest,
  updateLifecycleStatus,
  getMyRequests,
};
