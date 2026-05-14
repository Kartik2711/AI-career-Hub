require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const roadmapRoutes = require('./routes/roadmap');
const practiceRoutes = require('./routes/practice');
const questionRoutes = require('./routes/question');
const dashboardRoutes = require('./routes/dashboard');
const feedbackRoutes = require('./routes/feedback');
const notesRoutes = require('./routes/notes');
const learningPathRoutes = require('./routes/learningPath');
const interviewRoutes = require('./routes/interview');
const englishRoutes = require('./routes/english');
const practiceLogRoutes = require('./routes/practiceLog');
const jobQuestionsRoutes = require('./routes/jobQuestions');
const mockTestRoutes = require('./routes/mockTest');
const doubtRoutes = require('./routes/doubt');

const app = express();

const corsOptions = {
  origin: ['https://ai-carrer-tau.vercel.app', 'http://localhost:5173'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB Error:', err.message));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test AI endpoint (no auth required)
app.get('/test-ai', async (req, res) => {
  try {
    const { generateWithAI } = require('./utils/aiUtils');
    console.log('Testing AI API...');
    const result = await generateWithAI('Say "Hello" in 3 words');
    console.log('AI Test result:', result);
    res.json({ result });
  } catch (error) {
    console.error('AI Test Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Debug route - check if auth middleware passes
app.get('/api/debug', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  res.json({ hasToken: !!token, token: token ? token.substring(0, 20) + '...' : null });
});

app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/learning', learningPathRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/english', englishRoutes);
app.use('/api/practicelog', practiceLogRoutes);
app.use('/api/job-questions', jobQuestionsRoutes);
app.use('/api/mock-test', mockTestRoutes);
app.use('/api/doubts', doubtRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));