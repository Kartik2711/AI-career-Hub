const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const practiceLogController = require('../controllers/practiceLogController');

router.post('/log', requireAuth, practiceLogController.logPractice);
router.get('/calendar', requireAuth, practiceLogController.getCalendar);
router.get('/stats', requireAuth, practiceLogController.getStats);
router.delete('/:id', requireAuth, practiceLogController.deleteLog);

module.exports = router;