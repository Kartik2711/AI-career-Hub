const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['aptitude', 'coding'], required: true },
  topic: String,
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  timeTaken: Number,
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);