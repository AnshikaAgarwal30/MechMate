// const express = require('express');
// const router = express.Router();
// const {
//   createRequest,
//   getRequests,
//   getRequestById,
//   getAvailableRequests,
//   acceptRequest,
//   updateRequestStatus,
//   cancelRequest,
//   getAllRequests
// } = require('../controllers/requestController');
// const { protect, authorize } = require('../middleware/auth');
// const { upload } = require('../middleware/upload');

// router.post('/', protect, authorize('customer'), createRequest);
// router.get('/', protect, getRequests);
// router.get('/available', protect, authorize('mechanic'), getAvailableRequests);
// router.get('/all', protect, authorize('admin'), getAllRequests);
// router.get('/:id', protect, getRequestById);
// router.put('/:id/accept', protect, authorize('mechanic'), acceptRequest);
// router.put('/:id/status', protect, updateRequestStatus);
// router.put('/:id/cancel', protect, cancelRequest);

// module.exports = router;


const express = require('express');

const router = express.Router();

const {
  createRequest,
  getRequests,
  getRequestById,
  getAvailableRequests,
  acceptRequest,
  updateRequestStatus,
  cancelRequest,
  getAllRequests,
  getRecommendedMechanics
} = require('../controllers/requestController');

const { protect, authorize } = require('../middleware/auth');

const { upload } = require('../middleware/upload');

router.post('/', protect, authorize('customer'), createRequest);

router.get('/', protect, getRequests);

router.get('/available', protect, authorize('mechanic'), getAvailableRequests);

router.get('/all', protect, authorize('admin'), getAllRequests);

// Recommended Mechanics
router.get(
  '/:id/recommendations',
  protect,
  authorize('customer'),
  getRecommendedMechanics
);

router.get('/:id', protect, getRequestById);

router.put('/:id/accept', protect, authorize('mechanic'), acceptRequest);

router.put('/:id/status', protect, updateRequestStatus);

router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;