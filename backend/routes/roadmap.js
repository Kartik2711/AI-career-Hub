const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const roadmapController = require('../controllers/roadmapController');

router.post('/generate', requireAuth, roadmapController.generateRoadmap);
router.get('/all', requireAuth, roadmapController.getAllRoadmaps);
router.get('/:id', requireAuth, roadmapController.getRoadmap);
router.put('/:id/task/:taskId', requireAuth, roadmapController.updateTask);
router.delete('/:id', requireAuth, roadmapController.deleteRoadmap);

module.exports = router;