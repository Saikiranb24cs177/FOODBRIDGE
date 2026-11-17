const aiService = require('../services/aiService');

// @desc    Get AI matching recommendations for a food donation or NGO
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const { donationId, ngoId } = req.query;

    if (donationId) {
      const results = await aiService.getMatchingNgosForDonation(donationId);
      return res.status(200).json({ success: true, data: results });
    }

    const targetNgoId = ngoId || (req.user?.role === 'ngo' ? req.user._id : null);
    if (targetNgoId) {
      const results = await aiService.getMatchingDonationsForNgo(targetNgoId);
      return res.status(200).json({ success: true, data: results });
    }

    return res.status(400).json({
      success: false,
      message: 'Please provide donationId or ngoId to fetch AI recommendations',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food demand prediction analytics
// @route   GET /api/ai/demand-prediction
// @access  Public / Private
const getDemandPrediction = async (req, res, next) => {
  try {
    const data = await aiService.getFoodDemandPrediction();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI platform insights and coordination recommendations
// @route   GET /api/ai/insights
// @access  Public / Private
const getAiInsights = async (req, res, next) => {
  try {
    const data = await aiService.getAiInsights();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getDemandPrediction,
  getAiInsights,
};
