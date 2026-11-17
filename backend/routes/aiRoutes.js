const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getDemandPrediction,
  getAiInsights,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, getRecommendations);
router.get('/demand-prediction', getDemandPrediction);
router.get('/insights', getAiInsights);

module.exports = router;
