const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  dreamJob: { type: String },
  syllabus: {
    units: [{
      unitNumber: Number,
      title: String,
      description: String,
      phases: [{
        phaseNumber: Number,
        title: String,
        content: String,
        completed: { type: Boolean, default: false }
      }],
      completed: { type: Boolean, default: false }
    }]
  },
  currentUnit: { type: Number, default: 0 },
  currentPhase: { type: Number, default: 0 },
  status: { type: String, enum: ['created', 'in_progress', 'completed'], default: 'created' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LearningPath', learningPathSchema);