const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const mockTestController = require('../controllers/mockTestController');

router.post('/create', requireAuth, mockTestController.createTest);
router.get('/', requireAuth, mockTestController.getTests);
router.get('/:id', requireAuth, mockTestController.getTest);
router.post('/answer', requireAuth, mockTestController.submitAnswer);
router.post('/complete', requireAuth, mockTestController.completeTest);
router.get('/stats/summary', requireAuth, mockTestController.getStats);

module.exports = router;