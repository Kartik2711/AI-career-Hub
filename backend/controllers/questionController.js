const Question = require('../models/Question');
const { generateWithAI } = require('../utils/aiUtils');

exports.generateQuestions = async (req, res) => {
  try {
    const { type, difficulty, topic, count } = req.body;
    
    if (!type || !topic) {
      return res.status(400).json({ message: 'Type and topic are required' });
    }

    const prompt = type === 'coding' 
      ? `Generate ${count || 5} coding problem(s) about "${topic}" with ${difficulty || 'intermediate'} difficulty.
        
        Return ONLY valid JSON array (no markdown):
        [
          {
            "type": "coding",
            "difficulty": "beginner/intermediate/advanced",
            "topic": "${topic}",
            "title": "Problem title",
            "description": "Full problem description with examples",
            "testCases": [
              {"input": "input1", "expectedOutput": "output1"},
              {"input": "input2", "expectedOutput": "output2"}
            ],
            "solution": "Complete solution code",
            "explanation": "Explanation of the approach"
          }
        ]`
      : `Generate ${count || 5} ${type} question(s) about "${topic}" with ${difficulty || 'intermediate'} difficulty.
        
        Return ONLY valid JSON array (no markdown):
        [
          {
            "type": "${type}",
            "difficulty": "beginner/intermediate/advanced",
            "topic": "${topic}",
            "title": "Question title",
            "description": "Problem description",
            "options": [
              {"text": "Option A", "isCorrect": false},
              {"text": "Option B", "isCorrect": true},
              {"text": "Option C", "isCorrect": false},
              {"text": "Option D", "isCorrect": false}
            ],
            "solution": "Step-by-step solution",
            "explanation": "Complete explanation"
          }
        ]`;
    
    console.log('Generating questions for:', topic, type);
    let questionsData;
    try {
      questionsData = await generateWithAI(
        prompt,
        'You are an expert in generating educational questions. Generate ONLY valid JSON. No markdown.',
        true
      );
    } catch (aiError) {
      console.error('AI Error:', aiError.message);
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

exports.getQuestions = async (req, res) => {
  try {
    const { type, difficulty, topic } = req.query;
    const query = {};
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = topic;
    
    const questions = await Question.find(query).select('-solution -testCases');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};