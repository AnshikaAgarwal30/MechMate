const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updatePassword,
  addVehicle,
  getMechanics,
  getNearbyMechanics,
  approveMechanic,
  getAllUsers,
  deleteUser
} = require('../controllers/userController');
const { getRecommendedMechanics } = require('../controllers/mechanicMapController'); // new controller
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/vehicles', protect, addVehicle);
router.get('/mechanics', getMechanics);
router.get('/mechanics/nearby', getNearbyMechanics);
router.get('/mechanics/recommend', getRecommendedMechanics);
router.put('/mechanics/:id/approve', protect, authorize('admin'), approveMechanic);
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
