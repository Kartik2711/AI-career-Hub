const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const doubtController = require('../controllers/doubtController');

router.post('/ask', requireAuth, doubtController.askDoubt);
router.get('/', doubtController.getDoubts);
router.get('/my', requireAuth, doubtController.getMyDoubts);
router.get('/stats', doubtController.getStats);
router.get('/:id', doubtController.getDoubt);
router.post('/answer', requireAuth, doubtController.answerDoubt);
router.post('/regenerate', requireAuth, doubtController.regenerateAiAnswer);
router.post('/upvote/:id', doubtController.upvoteDoubt);
router.delete('/:id', requireAuth, doubtController.deleteDoubt);

module.exports = router;