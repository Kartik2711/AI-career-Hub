const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  type: { type: String, enum: ['aptitude', 'technical', 'mixed'], default: 'mixed' },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: Number,
    explanation: String,
    category: String
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);