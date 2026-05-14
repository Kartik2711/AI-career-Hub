const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const englishController = require('../controllers/englishController');

router.post('/generate', requireAuth, englishController.generateDailyWords);
router.get('/', requireAuth, englishController.getWords);
router.put('/:id', requireAuth, englishController.toggleLearned);
router.delete('/:id', requireAuth, englishController.deleteWord);

module.exports = router;