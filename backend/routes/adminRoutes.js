const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  verifyUser,
  updateUserStatus,
  getAllDonations,
  getReportedDonations,
  resolveReport,
  deleteDonation,
  getAllRequests,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id', updateUserStatus);

router.get('/donations', getAllDonations);
router.delete('/donations/:id', deleteDonation);

router.get('/requests', getAllRequests);

router.get('/reports', getReportedDonations);
router.put('/reports/:id/resolve', resolveReport);

module.exports = router;
