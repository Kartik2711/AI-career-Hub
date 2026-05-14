const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');

router.post('/generate', requireAuth, interviewController.generateInterviewContent);
router.post('/generate-more', requireAuth, interviewController.generateMoreQuestions);
router.get('/categories', requireAuth, interviewController.getInterviewCategories);
router.get('/:category', requireAuth, interviewController.getCategoryQuestions);
router.post('/toggle', requireAuth, interviewController.togglePracticeComplete);
router.post('/notes', requireAuth, interviewController.updateNotes);

module.exports = router;