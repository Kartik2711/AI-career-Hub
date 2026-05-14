const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

router.post('/analyze', requireAuth, feedbackController.analyzePerformance);

module.exports = router;