const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  updateDonation,
  cancelDonation,
  reportDonation,
  deleteDonation,
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getDonations);
router.get('/my-donations', protect, authorize('donor', 'admin'), getMyDonations);
router.get('/:id', getDonationById);

router.post('/', protect, authorize('donor', 'admin'), createDonation);
router.put('/:id', protect, authorize('donor', 'admin'), updateDonation);
router.put('/:id/cancel', protect, authorize('donor', 'admin'), cancelDonation);
router.delete('/:id', protect, authorize('donor', 'admin'), deleteDonation);
router.post('/:id/report', protect, reportDonation);

module.exports = router;
