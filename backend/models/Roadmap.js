const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dreamJob: { type: String, required: true },
  duration: { type: String, enum: ['30', '60', '90'], required: true },
  roadmap: {
    weeks: [{
      week: Number,
      focus: String,
      topics: [String],
      dailyTasks: [{
        day: Number,
        task: String,
        completed: { type: Boolean, default: false }
      }],
      tools: [String],
      resources: [{
        title: String,
        link: String
      }]
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);