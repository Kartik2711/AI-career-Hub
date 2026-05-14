const mongoose = require('mongoose');

const englishWordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  meaning: String,
  pronunciation: String,
  example: String,
  partOfSpeech: String,
  learned: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnglishWord', englishWordSchema);