const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const learningPathController = require('../controllers/learningPathController');

router.post('/create-syllabus', requireAuth, learningPathController.createSyllabus);
router.post('/start-unit', requireAuth, learningPathController.startUnit);
router.post('/explain-phase', requireAuth, learningPathController.explainPhase);
router.post('/complete-phase', requireAuth, learningPathController.completePhase);
router.get('/', requireAuth, learningPathController.getLearningPaths);
router.get('/:id', requireAuth, learningPathController.getLearningPath);
router.delete('/:id', requireAuth, learningPathController.deleteLearningPath);

module.exports = router;