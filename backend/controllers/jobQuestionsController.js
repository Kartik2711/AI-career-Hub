const JobQuestion = require('../models/JobQuestion');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { generateWithAI } = require('../utils/aiUtils');

exports.generateQuestions = async (req, res) => {
  try {
    const { jobRole, questionType, count } = req.body;
    
    if (!jobRole) {
      return res.status(400).json({ message: 'Job role is required' });
    }

    const questionCount = count || 15;
    const types = questionType === 'both' ? ['technical', 'hr'] : [questionType || 'both'];
    
    // Get user's roadmap to understand their course
    const roadmap = await Roadmap.findOne({ userId: req.user.id, status: 'active' });
    const courseInfo = roadmap ? roadmap.course : jobRole;

    const prompt = `Generate ${questionCount} interview questions for the role of "${jobRole}" based on course: "${courseInfo}".
    
    Include a mix of:
    - Technical questions (coding, problem-solving, technical concepts)
    - HR/Behavioral questions ( Situational, about experience, team work, etc)
    
    For each question provide:
    - question: The interview question
    - type: "technical" or "hr"
    - sampleAnswer: A model answer (2-3 sentences)
    - tips: 2-3 tips for answering
    - difficulty: "easy", "medium", or "hard"
    - category: The topic/category this question belongs to
    
    Return ONLY valid JSON array:
    [
      {"question": "...", "type": "technical/hr", "sampleAnswer": "...", "tips": ["tip1", "tip2"], "difficulty": "medium", "category": "React"}
    ]`;

    const aiResponse = await generateWithAI(
      prompt,
      'You are an expert interview coach. Generate ONLY valid JSON. No markdown.',
      true
    );
    
    let questions = [];
    if (Array.isArray(aiResponse)) {
      questions = aiResponse;
    } else if (aiResponse?.questions) {
      questions = aiResponse.questions;
    }

    const jobQuestion = await JobQuestion.create({
      userId: req.user.id,
      jobRole,
      questions
    });

    res.json(jobQuestion);
  } catch (error) {
    console.error('Job Questions Generation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getJobQuestions = async (req, res) => {
  try {
    const { jobRole, type } = req.query;
    const query = { userId: req.user.id };
    
    if (jobRole) query.jobRole = jobRole;
    
    const questions = await JobQuestion.find(query).sort({ generatedAt: -1 });
    
    if (type && type !== 'both') {
      questions.forEach(q => {
        q.questions = q.questions.filter(qq => qq.type === type);
      });
    }
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const { questionId } = req.body;
    
    const jobQuestion = await JobQuestion.findOne({
      userId: req.user.id,
      'questions._id': questionId
    });
    
    if (!jobQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const question = jobQuestion.questions.id(questionId);
    question.completed = !question.completed;
    await jobQuestion.save();
    
    res.json(jobQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.regenerateQuestions = async (req, res) => {
  try {
    const { jobRole } = req.body;
    const existing = await JobQuestion.findOne({ userId: req.user.id, jobRole });
    
    if (existing) {
      await JobQuestion.findByIdAndDelete(existing._id);
    }
    
    return exports.generateQuestions(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};