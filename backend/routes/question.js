const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

router.post('/generate', requireAuth, questionController.generateQuestions);
router.get('/', requireAuth, questionController.getQuestions);
router.get('/:id', requireAuth, questionController.getQuestion);

module.exports = router;