const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  content: {
    explanation: String,
    examples: [String],
    useCases: [String],
    keyPoints: [String]
  },
  relatedRoadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);