const MockTest = require('../models/MockTest');
const { generateWithAI } = require('../utils/aiUtils');

exports.createTest = async (req, res) => {
  try {
    const { topic, type, questionCount } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const count = questionCount || 10;
    const testType = type || 'mixed';

    const prompt = `Generate ${count} multiple choice questions for practice test on topic: "${topic}".
    
    Question types can be: aptitude (math, reasoning, verbal), technical (coding, concepts), or mixed.
    
    For each question provide:
    - question: The question text
    - options: Array of 4 options ["option1", "option2", "option3", "option4"]
    - correctAnswer: Index of correct answer (0-3)
    - explanation: Brief explanation of the answer
    - category: Topic category
    
    Return ONLY valid JSON array:
    [
      {"question": "...", "options": ["a", "b", "c", "d"], "correctAnswer": 1, "explanation": "...", "category": "JavaScript"}
    ]`;

    const aiResponse = await generateWithAI(
      prompt,
      'You are an expert teacher. Generate ONLY valid JSON. No markdown.',
      true
    );
    
    let questions = [];
    if (Array.isArray(aiResponse)) {
      questions = aiResponse;
    } else if (aiResponse?.questions) {
      questions = aiResponse.questions;
    }

    const mockTest = await MockTest.create({
      userId: req.user.id,
      topic,
      type: testType,
      questions,
      totalQuestions: questions.length,
      status: 'in_progress'
    });

    res.json(mockTest);
  } catch (error) {
    console.error('Mock Test Creation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getTests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };
    if (status) query.status = status;
    
    const tests = await MockTest.find(query).sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTest = async (req, res) => {
  try {
    const test = await MockTest.findOne({ _id: req.params.id, userId: req.user.id });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { testId, questionIndex, userAnswer } = req.body;
    
    const test = await MockTest.findOne({ _id: testId, userId: req.user.id });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    if (questionIndex >= 0 && questionIndex < test.questions.length) {
      test.questions[questionIndex].userAnswer = userAnswer;
      
      const isCorrect = userAnswer === test.questions[questionIndex].correctAnswer;
      test.correctAnswers = test.questions.filter((q, i) => q.userAnswer === q.correctAnswer).length;
      test.score = Math.round((test.correctAnswers / test.totalQuestions) * 100);
      
      await test.save();
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeTest = async (req, res) => {
  try {
    const { testId, timeTaken } = req.body;
    
    const test = await MockTest.findOne({ _id: testId, userId: req.user.id });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    test.status = 'completed';
    test.completedAt = new Date();
    if (timeTaken) test.timeTaken = timeTaken;
    
    test.correctAnswers = test.questions.filter(q => q.userAnswer === q.correctAnswer).length;
    test.score = Math.round((test.correctAnswers / test.totalQuestions) * 100);
    
    await test.save();
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const tests = await MockTest.find({ userId: req.user.id, status: 'completed' });
    
    const stats = {
      totalTests: tests.length,
      averageScore: tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + t.score, 0) / tests.length) : 0,
      totalQuestions: tests.reduce((sum, t) => sum + t.totalQuestions, 0),
      correctAnswers: tests.reduce((sum, t) => sum + t.correctAnswers, 0),
      totalTime: tests.reduce((sum, t) => sum + (t.timeTaken || 0), 0),
      byTopic: {},
      recentTests: tests.slice(0, 5)
    };
    
    tests.forEach(test => {
      if (!stats.byTopic[test.topic]) {
        stats.byTopic[test.topic] = { tests: 0, totalScore: 0 };
      }
      stats.byTopic[test.topic].tests++;
      stats.byTopic[test.topic].totalScore += test.score;
    });
    
    Object.keys(stats.byTopic).forEach(topic => {
      stats.byTopic[topic].average = Math.round(stats.byTopic[topic].totalScore / stats.byTopic[topic].tests);
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};