const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['study', 'personal', 'career', 'general', 'technical'], 
    default: 'general' 
  },
  question: { type: String, required: true },
  description: String,
  aiAnswer: String,
  expertAnswer: String,
  answers: [{
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    answer: String,
    isExpert: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['pending', 'answered', 'in_progress'], default: 'pending' },
  isAnonymous: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);