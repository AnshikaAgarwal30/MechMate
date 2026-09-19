const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/', protect, getBookings);
router.get('/all', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
