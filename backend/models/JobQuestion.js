const mongoose = require('mongoose');

const jobQuestionsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobRole: { type: String, required: true },
  questions: [{
    question: String,
    type: { type: String, enum: ['technical', 'hr'] },
    answer: String,
    sampleAnswer: String,
    tips: [String],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    category: String,
    completed: { type: Boolean, default: false }
  }],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('JobQuestion', jobQuestionsSchema);