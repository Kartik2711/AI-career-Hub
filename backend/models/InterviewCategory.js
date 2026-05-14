const mongoose = require('mongoose');

const interviewCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['communication', 'technical', 'body_language', 'manager_round'], required: true },
  questions: [{
    question: String,
    sampleAnswer: String,
    tips: [String],
    practiceCompleted: { type: Boolean, default: false }
  }],
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewCategory', interviewCategorySchema);