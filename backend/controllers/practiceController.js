const axios = require('axios');
const Question = require('../models/Question');
const Progress = require('../models/Progress');

exports.getAptitudeTopics = (req, res) => {
  res.json([
    'Percentage', 'Ratio', 'Profit and Loss', 'Time and Work', 
    'Simple Interest', 'Number System', 'Averages', 'Probability',
    'Permutation and Combination', 'Quadratic Equations', 'Mixture and Alligation'
  ]);
};

exports.generateAptitudeQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const prompt = `Generate ${count || 15} aptitude questions about "${topic}" with ${difficulty || 'mixed'} difficulty level.
    
    For EACH question, include:
    - A clear problem statement
    - 4 options (A, B, C, D) with one correct answer
    - Step-by-step solution/trick
    - Shortcut tricks if applicable
    - Common mistakes to avoid
    
    Return ONLY valid JSON array (no markdown):
    [
      {
        "type": "aptitude",
        "difficulty": "beginner/intermediate/advanced",
        "topic": "${topic}",
        "title": "Question title",
        "description": "Full question with numbers",
        "options": [
          {"text": "Option A", "isCorrect": false},
          {"text": "Option B", "isCorrect": true},
          {"text": "Option C", "isCorrect": false},
          {"text": "Option D", "isCorrect": false}
        ],
        "solution": "Step-by-step solution",
        "trick": "Short trick to solve faster",
        "commonMistake": "Common mistake students make",
        "explanation": "Complete explanation"
      }
    ]`;
    
    console.log('Generating aptitude questions for:', topic);
    let questionsData;
    try {
      questionsData = await generateWithAI(
        prompt,
        'You are an expert aptitude teacher. Generate ONLY valid JSON. No markdown.',
        true
      );
    } catch (aiError) {
      return res.status(500).json({ message: 'Failed to generate questions. Please try again.' });
    }
    
    if (!Array.isArray(questionsData)) {
      questionsData = questionsData ? [questionsData] : [];
    }
    
    const questions = await Question.insertMany(questionsData);
    res.json(questions);
  } catch (error) {
    console.error('Question Generation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getAptitudeQuestions = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    const query = { type: 'aptitude' };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    const questions = await Question.find(query).select('-solution -testCases -trick -commonMistake');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAptitudeQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitAptitude = async (req, res) => {
  try {
    const { questionId, answer, timeTaken } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    const selectedOption = question.options.find(opt => opt._id.toString() === answer);
    const isCorrect = selectedOption?.isCorrect || false;
    
    const progress = await Progress.create({
      userId: req.user.id,
      type: 'aptitude',
      topic: question.topic,
      score: isCorrect ? 1 : 0,
      totalQuestions: 1,
      correctAnswers: isCorrect ? 1 : 0,
      timeTaken
    });
    
    res.json({ 
      isCorrect, 
      correctAnswer: question.options.find(opt => opt.isCorrect), 
      solution: question.solution,
      trick: question.trick,
      commonMistake: question.commonMistake,
      explanation: question.explanation, 
      progress 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitCoding = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    const languageMap = { 
      javascript: 63, 
      python: 71, 
      java: 62, 
      cpp: 54 
    };
    const langId = languageMap[language] || 63;
    
    console.log('Submitting code - Language:', language, 'ID:', langId);
    console.log('Test input:', question.testCases?.[0]?.input);
    
    try {
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions',
        {
          source_code: Buffer.from(code).toString('base64'),
          language_id: langId,
          stdin: question.testCases?.[0]?.input ? Buffer.from(question.testCases[0].input).toString('base64') : '',
          expected_output: question.testCases?.[0]?.expectedOutput ? Buffer.from(question.testCases[0].expectedOutput).toString('base64') : '',
          base64_encoded: true,
          wait: true
        },
        {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const result = response.data;
      console.log('Judge0 result status:', result.status);
      
      const isCorrect = result.status?.id === 3;
      
      await Progress.create({
        userId: req.user.id,
        type: 'coding',
        topic: question.topic,
        score: isCorrect ? 1 : 0,
        totalQuestions: 1,
        correctAnswers: isCorrect ? 1 : 0
      });
      
      res.json({ 
        status: result.status?.description || 'Unknown', 
        output: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '',
        isCorrect, 
        expected: question.testCases?.[0]?.expectedOutput,
        compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : ''
      });
    } catch (judgeError) {
      console.error('Judge0 Error:', judgeError.response?.status, judgeError.message);
      
      res.json({ 
        status: 'API Error', 
        output: `Error: ${judgeError.response?.status || 'Unknown'}. The Judge0 free tier may be rate limited.`,
        isCorrect: false,
        error: true
      });
    }
  } catch (error) {
    console.error('Coding submission error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getCodingQuestions = async (req, res) => {
  try {
    const { difficulty, topic } = req.query;
    const query = { type: 'coding' };
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = topic;
    
    const questions = await Question.find(query).select('-solution -testCases');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function generateWithAI(prompt, systemPrompt) {
  const { generateWithAI: genAI } = require('../utils/aiUtils');
  return await genAI(prompt, systemPrompt, true);
}