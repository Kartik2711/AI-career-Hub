const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['aptitude', 'coding'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  topic: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  solution: String,
  explanation: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);