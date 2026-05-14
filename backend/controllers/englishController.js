const EnglishWord = require('../models/EnglishWord');
const { generateWithAI } = require('../utils/aiUtils');

exports.generateDailyWords = async (req, res) => {
  try {
    const { count } = req.body;
    const wordCount = count || 10;

    const prompt = `Generate ${wordCount} new English vocabulary words with detailed information. Focus on advanced professional/business English words.
    
    Return ONLY valid JSON array:
    [
      {
        "word": "word",
        "meaning": "clear meaning in simple English",
        "pronunciation": "phonetic pronunciation",
        "example": "a practical example sentence",
        "synonyms": ["word1", "word2", "word3"],
        "antonyms": ["word1", "word2"],
        "partOfSpeech": "noun/verb/adjective/etc",
        "usage": "how to use this word in sentences",
        "category": "business/technical/academic/daily"
      }
    ]`;

    const wordsData = await generateWithAI(
      prompt,
      'You are an English language expert. Generate ONLY valid JSON. No markdown.',
      true
    );
    
    if (!Array.isArray(wordsData)) wordsData = wordsData ? [wordsData] : [];

    const words = await EnglishWord.insertMany(
      wordsData.map(w => ({
        userId: req.user.id,
        word: w.word,
        meaning: w.meaning,
        pronunciation: w.pronunciation,
        example: w.example,
        synonyms: w.synonyms || [],
        antonyms: w.antonyms || [],
        partOfSpeech: w.partOfSpeech,
        usage: w.usage || '',
        category: w.category || 'general',
        learned: false
      }))
    );

    res.json(words);
  } catch (error) {
    console.error('Word Generation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getWords = async (req, res) => {
  try {
    const { learned, category } = req.query;
    const query = { userId: req.user.id };
    if (learned !== undefined) {
      query.learned = learned === 'true';
    }
    if (category) {
      query.category = category;
    }

    const words = await EnglishWord.find(query).sort({ dateAdded: -1 });
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleLearned = async (req, res) => {
  try {
    const word = await EnglishWord.findOne({ _id: req.params.id, userId: req.user.id });
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    word.learned = !word.learned;
    await word.save();
    res.json(word);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWord = async (req, res) => {
  try {
    await EnglishWord.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Word deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const words = await EnglishWord.find({ userId: req.user.id });
    
    const stats = {
      total: words.length,
      learned: words.filter(w => w.learned).length,
      byCategory: {},
      byPartOfSpeech: {}
    };

    words.forEach(word => {
      if (!stats.byCategory[word.category]) stats.byCategory[word.category] = 0;
      stats.byCategory[word.category]++;
      
      if (!stats.byPartOfSpeech[word.partOfSpeech]) stats.byPartOfSpeech[word.partOfSpeech] = 0;
      stats.byPartOfSpeech[word.partOfSpeech]++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};