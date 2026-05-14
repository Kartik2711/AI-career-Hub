const mongoose = require('mongoose');

const practiceLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['aptitude', 'coding', 'roadmap', 'notes', 'learning'], required: true },
  status: { type: String, enum: ['completed', 'partial', 'missed'], required: true },
  duration: Number, // in minutes
  details: String,
  createdAt: { type: Date, default: Date.now }
});

practiceLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('PracticeLog', practiceLogSchema);