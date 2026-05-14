const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');
const Note = require('../models/Note');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const roadmap = await Roadmap.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const progress = await Progress.find({ userId: req.user.id });
    const notes = await Note.find({ userId: req.user.id });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = user.dailyStreak;
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 0;
      }
    }
    
    await User.findByIdAndUpdate(req.user.id, { 
      dailyStreak: streak, 
      lastActiveDate: today 
    });
    
    let completedTasks = 0;
    let totalTasks = 0;
    if (roadmap?.roadmap?.weeks) {
      for (const week of roadmap.roadmap.weeks) {
        for (const task of week.dailyTasks) {
          totalTasks += 1;
          if (task.completed) completedTasks += 1;
        }
      }
    }
    
    const aptitudeProgress = progress.filter(p => p.type === 'aptitude');
    const codingProgress = progress.filter(p => p.type === 'coding');
    
    const aptitudeScore = aptitudeProgress.length > 0 
      ? Math.round((aptitudeProgress.reduce((sum, p) => sum + p.correctAnswers, 0) / aptitudeProgress.reduce((sum, p) => sum + p.totalQuestions, 0)) * 100) 
      : 0;
    
    const codingScore = codingProgress.length > 0 
      ? Math.round((codingProgress.reduce((sum, p) => sum + p.correctAnswers, 0) / codingProgress.reduce((sum, p) => sum + p.totalQuestions, 0)) * 100) 
      : 0;
    
    const topicScores = {};
    progress.forEach(p => {
      if (!topicScores[p.topic]) topicScores[p.topic] = { correct: 0, total: 0 };
      topicScores[p.topic].correct += p.correctAnswers;
      topicScores[p.topic].total += p.totalQuestions;
    });
    
    const weakAreas = Object.entries(topicScores)
      .filter(([_, data]) => data.total > 0)
      .map(([topic, data]) => ({
        topic,
        score: Math.round((data.correct / data.total) * 100)
      }))
      .filter(item => item.score < 60)
      .sort((a, b) => a.score - b.score);
    
    res.json({
      user: { name: user.name, email: user.email, dreamJob: user.dreamJob },
      roadmap: roadmap ? { dreamJob: roadmap.dreamJob, duration: roadmap.duration, completedTasks, totalTasks } : null,
      progress: { aptitudeScore, codingScore, totalAttempts: progress.length },
      streak,
      weakAreas: weakAreas.slice(0, 5),
      notesCount: notes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};