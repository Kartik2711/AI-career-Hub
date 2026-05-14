const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const jobQuestionsController = require('../controllers/jobQuestionsController');

router.post('/generate', requireAuth, jobQuestionsController.generateQuestions);
router.get('/', requireAuth, jobQuestionsController.getJobQuestions);
router.post('/toggle', requireAuth, jobQuestionsController.toggleComplete);
router.post('/regenerate', requireAuth, jobQuestionsController.regenerateQuestions);

module.exports = router;