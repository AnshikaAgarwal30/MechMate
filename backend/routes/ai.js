const express = require('express');
const router = express.Router();
const { diagnoseBreakdown } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// POST /api/ai/diagnose
// Upload optional image and analyze symptoms via Gemini Vision / Rules
router.post('/diagnose', protect, upload.single('image'), diagnoseBreakdown);

module.exports = router;
