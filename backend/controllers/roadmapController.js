const Roadmap = require('../models/Roadmap');
const { generateWithAI } = require('../utils/aiUtils');

exports.generateRoadmap = async (req, res) => {
  try {
    const { dreamJob, currentSkills, duration } = req.body;
    
    if (!dreamJob) {
      return res.status(400).json({ message: 'Dream job is required' });
    }
    
    const prompt = `Generate a ${duration}-day career roadmap for becoming a ${dreamJob}. 
    User's current skills: ${currentSkills?.join(', ') || 'None'}.
    
    Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
    {
      "weeks": [
        {
          "week": 1,
          "focus": "Focus area name",
          "topics": ["topic1", "topic2"],
          "dailyTasks": [
            {"day": 1, "task": "Task description", "completed": false}
          ],
          "tools": ["tool1", "tool2"],
          "resources": [{"title": "Resource name", "link": "URL"}]
        }
      ]
    }`;
    
    console.log('Calling AI for roadmap generation...');
    let roadmapData;
    try {
      roadmapData = await generateWithAI(
        prompt,
        'You are an expert career advisor. Return ONLY valid JSON. No markdown, no explanations. Start with { and end with }.',
        true
      );
    } catch (aiError) {
      console.error('AI Error:', aiError.message);
      return res.status(500).json({ message: 'Failed to generate roadmap. Please try again.' });
    }
    
    if (!roadmapData || typeof roadmapData !== 'object') {
      return res.status(500).json({ message: 'Failed to generate valid roadmap. Please try again.' });
    }
    
    const roadmap = await Roadmap.create({
      userId: req.user.id,
      dreamJob,
      duration,
      roadmap: roadmapData
    });
    
    res.json(roadmap);
  } catch (error) {
    console.error('Roadmap Generation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { completed } = req.body;
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user.id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    
    for (const week of roadmap.roadmap.weeks) {
      for (const task of week.dailyTasks) {
        if (task._id.toString() === req.params.taskId) {
          task.completed = completed;
          break;
        }
      }
    }
    
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json({ message: 'Roadmap deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};