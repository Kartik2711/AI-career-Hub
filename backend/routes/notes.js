const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const notesController = require('../controllers/notesController');

router.post('/generate', requireAuth, notesController.generateNote);
router.get('/', requireAuth, notesController.getNotes);
router.get('/:id', requireAuth, notesController.getNote);
router.delete('/:id', requireAuth, notesController.deleteNote);

module.exports = router;