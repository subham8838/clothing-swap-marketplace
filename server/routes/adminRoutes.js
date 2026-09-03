const express = require('express');
const {
  getDashboard, getUsers, getListings, suspendUser, activateUser,
  removeListing, restoreListing, getReports, resolveReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/listings', getListings);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);
router.delete('/listings/:id', removeListing);
router.put('/listings/:id/restore', restoreListing);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

module.exports = router;
