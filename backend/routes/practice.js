const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const practiceController = require('../controllers/practiceController');

router.get('/aptitude/topics', practiceController.getAptitudeTopics);
router.post('/aptitude/generate', requireAuth, practiceController.generateAptitudeQuestions);
router.get('/aptitude/questions', requireAuth, practiceController.getAptitudeQuestions);
router.get('/aptitude/question/:id', requireAuth, practiceController.getAptitudeQuestionById);
router.post('/aptitude/submit', requireAuth, practiceController.submitAptitude);
router.post('/coding/submit', requireAuth, practiceController.submitCoding);
router.get('/coding/questions', requireAuth, practiceController.getCodingQuestions);

module.exports = router;