const PracticeLog = require('../models/PracticeLog');
const User = require('../models/User');

exports.logPractice = async (req, res) => {
  try {
    const { date, type, status, duration, details, problemName, problemUrl } = req.body;
    
    const log = await PracticeLog.create({
      userId: req.user.id,
      date: new Date(date || new Date().setHours(0,0,0,0)),
      type,
      status,
      duration,
      details,
      problemName,
      problemUrl
    });

    const user = await User.findById(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.dailyStreak += 1;
      } else if (diffDays > 1) {
        user.dailyStreak = 1;
      }
    } else {
      user.dailyStreak = 1;
    }
    user.lastActiveDate = today;
    await user.save();

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const logs = await PracticeLog.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const calendarData = {};
    logs.forEach(log => {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = { 
          completed: 0, 
          missed: 0, 
          partial: 0,
          types: {},
          logs: []
        };
      }
      if (log.status === 'completed') calendarData[dateKey].completed++;
      else if (log.status === 'missed') calendarData[dateKey].missed++;
      else calendarData[dateKey].partial++;
      
      if (!calendarData[dateKey].types[log.type]) {
        calendarData[dateKey].types[log.type] = 0;
      }
      calendarData[dateKey].types[log.type]++;
      
      calendarData[dateKey].logs.push({
        id: log._id,
        type: log.type,
        status: log.status,
        duration: log.duration,
        details: log.details,
        problemName: log.problemName,
        problemUrl: log.problemUrl
      });
    });

    res.json(calendarData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const logs = await PracticeLog.find({ userId: req.user.id }).sort({ date: -1 });
    
    const totalCompleted = logs.filter(l => l.status === 'completed').length;
    const totalMissed = logs.filter(l => l.status === 'missed').length;
    const totalPartial = logs.filter(l => l.status === 'partial').length;
    const totalMinutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);

    const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
      
      if (diff === tempStreak && log.status === 'completed') {
        tempStreak++;
      } else if (diff > tempStreak) {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = log.status === 'completed' ? 1 : 0;
      }
      
      if (diff === currentStreak && log.status === 'completed') {
        currentStreak++;
      } else if (diff > currentStreak) {
        break;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    const byType = {};
    logs.forEach(log => {
      if (!byType[log.type]) {
        byType[log.type] = { completed: 0, missed: 0, partial: 0, total: 0 };
      }
      byType[log.type][log.status]++;
      byType[log.type].total++;
    });

    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekLogs = logs.filter(l => {
        const logDate = new Date(l.date);
        return logDate >= weekStart && logDate <= weekEnd && l.status === 'completed';
      });
      
      weeklyData.push({
        week: `Week ${4 - i}`,
        completed: weekLogs.length,
        minutes: weekLogs.reduce((sum, l) => sum + (l.duration || 0), 0)
      });
    }

    res.json({
      totalCompleted,
      totalMissed,
      totalPartial,
      totalMinutes,
      currentStreak,
      longestStreak,
      byType,
      weeklyData,
      logs: logs.slice(0, 50)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    await PracticeLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Practice log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};