const Progress = require('../models/Progress');
const { generateWithAI } = require('../utils/aiUtils');

exports.analyzePerformance = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id });
    
    const aptitudeProgress = progress.filter(p => p.type === 'aptitude');
    const codingProgress = progress.filter(p => p.type === 'coding');
    
    const topicStats = {};
    progress.forEach(p => {
      if (!topicStats[p.topic]) topicStats[p.topic] = { correct: 0, total: 0 };
      topicStats[p.topic].correct += p.correctAnswers;
      topicStats[p.topic].total += p.totalQuestions;
    });
    
    const prompt = `Analyze the user's performance data and provide feedback.
    
    Total attempts: ${progress.length}
    Aptitude attempts: ${aptitudeProgress.length}
    Coding attempts: ${codingProgress.length}
    
    Topic-wise performance: ${JSON.stringify(topicStats)}
    
    Return a JSON with this structure:
    {
      "overallPerformance": "Good/Fair/Needs Improvement",
      "strengths": ["topic1", "topic2"],
      "weaknesses": ["topic1", "topic2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "recommendedNextTopics": ["topic1", "topic2"],
      "studyPlan": "Brief study plan recommendation"
    }`;
    
    const feedbackData = await generateWithAI(
      prompt,
      'You are an expert educational analyst. Analyze performance and provide actionable feedback. Generate ONLY valid JSON.',
      true
    );
    
    if (!feedbackData || typeof feedbackData !== 'object') {
      return res.status(500).json({ message: 'Failed to generate feedback. Please try again.' });
    }
    
    res.json(feedbackData);
    
    res.json(feedbackData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};