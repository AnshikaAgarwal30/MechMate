const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  respondToReview,
  getAllReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createReview);
router.get('/', getReviews);
router.get('/all', protect, authorize('admin'), getAllReviews);
router.get('/:id', protect, getReviewById);
router.put('/:id/respond', protect, authorize('mechanic'), respondToReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
