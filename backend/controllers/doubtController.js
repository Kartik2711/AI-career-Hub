const Doubt = require('../models/Doubt');
const User = require('../models/User');
const { generateWithAI } = require('../utils/aiUtils');

exports.askDoubt = async (req, res) => {
  try {
    const { question, category, description, isAnonymous, tags } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const userDoc = await User.findById(req.user.id);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const doubt = await Doubt.create({
      userId: userDoc._id,
      userName: isAnonymous ? 'Anonymous' : userDoc.name,
      question,
      category: category || 'general',
      description,
      isAnonymous: isAnonymous || false,
      tags: tags || []
    });

    // Generate AI answer in background
    generateDoubtAnswer(doubt._id, question, category).catch(console.error);

    res.json(doubt);
  } catch (error) {
    console.error('Ask Doubt Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

async function generateDoubtAnswer(doubtId, question, category) {
  try {
    const prompt = `You are a wise teacher and mentor. A student has asked this question: "${question}"
    
    Category: ${category || 'general'}
    
    Provide a thoughtful, encouraging, and helpful answer. 
    - If it's a study question, explain clearly with examples
    - If it's personal, offer emotional support and practical advice
    - If it's career, give professional guidance
    - Be empathetic and understanding
    
    Keep your answer concise but comprehensive (2-3 paragraphs).`;

    const aiResponse = await generateWithAI(prompt, 'You are a compassionate mentor and teacher.');
    
    await Doubt.findByIdAndUpdate(doubtId, {
      aiAnswer: aiResponse,
      status: 'answered'
    });
  } catch (error) {
    console.error('AI Answer Error:', error.message);
    await Doubt.findByIdAndUpdate(doubtId, { status: 'pending' });
  }
}

exports.getDoubts = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};
    
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const doubts = await Doubt.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    
    doubt.views = (doubt.views || 0) + 1;
    await doubt.save();
    
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.answerDoubt = async (req, res) => {
  try {
    const { doubtId, answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({ message: 'Answer is required' });
    }
    
    const userDoc = await User.findById(req.user.id);
    
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    
    doubt.answers.push({
      userId: userDoc._id,
      userName: userDoc.name,
      answer,
      isExpert: false
    });
    
    doubt.status = 'answered';
    await doubt.save();
    
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.regenerateAiAnswer = async (req, res) => {
  try {
    const { doubtId } = req.body;
    
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    
    const prompt = `You are a wise teacher and mentor. A student has asked this question: "${doubt.question}"
    
    Provide a thoughtful, encouraging, and helpful answer. Be clear and empathetic.`;

    const aiResponse = await generateWithAI(prompt, 'You are a compassionate teacher.');
    
    doubt.aiAnswer = aiResponse;
    doubt.status = 'answered';
    await doubt.save();
    
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upvoteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }
    
    doubt.upvotes = (doubt.upvotes || 0) + 1;
    await doubt.save();
    
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoubtsByUser = async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDoubt = async (req, res) => {
  try {
    await Doubt.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Doubt deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const allDoubts = await Doubt.find();
    
    const stats = {
      total: allDoubts.length,
      byCategory: {},
      answered: allDoubts.filter(d => d.status === 'answered').length,
      pending: allDoubts.filter(d => d.status === 'pending').length,
      totalViews: allDoubts.reduce((sum, d) => sum + (d.views || 0), 0),
      totalUpvotes: allDoubts.reduce((sum, d) => sum + (d.upvotes || 0), 0)
    };
    
    allDoubts.forEach(d => {
      if (!stats.byCategory[d.category]) stats.byCategory[d.category] = 0;
      stats.byCategory[d.category]++;
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};