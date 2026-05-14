const LearningPath = require('../models/LearningPath');
const { generateWithAI } = require('../utils/aiUtils');

exports.createSyllabus = async (req, res) => {
  try {
    const { topic, dreamJob, unitCount } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const units = unitCount || 5;
    
    const prompt = `Create a comprehensive ${units}-unit structured learning path/syllabus for learning "${topic}" to become a ${dreamJob || 'professional'}.

    The topic could be anything - a programming language, framework, technology, concept, methodology, domain, or tool. Adapt the curriculum accordingly.
    
    Each unit should have:
    - A clear, descriptive title
    - A comprehensive description of what will be covered
    - 4 phases/sections within each unit (theory, practice, exercises, projects)
    - Each phase should have a title and placeholder content
    
    Make sure the units progress logically from beginner to advanced.
    
    CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanatory text, no code blocks. Start your response with { and end with }.
    The JSON must be parseable by JSON.parse() without any errors.
    
    Required JSON structure:
    {
      "topic": "${topic}",
      "category": "Detect appropriate category (Programming, Web Dev, DevOps, Data Science, Cloud, etc.)",
      "units": [
        {
          "unitNumber": 1,
          "title": "Unit Title",
          "description": "What this unit covers - comprehensive description",
          "phases": [
            {"phaseNumber": 1, "title": "Phase Title - Theory/Concepts", "content": ""},
            {"phaseNumber": 2, "title": "Phase Title - Hands-on/Practice", "content": ""},
            {"phaseNumber": 3, "title": "Phase Title - Exercises/Problems", "content": ""},
            {"phaseNumber": 4, "title": "Phase Title - Project/Mini-Project", "content": ""}
          ]
        }
      ]
    }`;
    
    console.log('Generating syllabus for:', topic);
    let aiResponse;
    try {
      aiResponse = await generateWithAI(
        prompt,
        'You are an expert curriculum designer. You MUST output ONLY valid JSON - no markdown, no explanations, no text before or after. Start with { and end with }. The JSON must parse without errors.',
        true
      );
    } catch (aiError) {
      console.error('AI Error:', aiError.message);
      
      const fallbackSyllabus = {
        topic: topic,
        category: 'General',
        units: Array.from({ length: units }, (_, i) => ({
          unitNumber: i + 1,
          title: `Unit ${i + 1}: ${topic}`,
          description: `Learn essential concepts of ${topic} in this unit.`,
          phases: [
            { phaseNumber: 1, title: 'Theory & Concepts', content: '' },
            { phaseNumber: 2, title: 'Hands-on Practice', content: '' },
            { phaseNumber: 3, title: 'Exercises', content: '' },
            { phaseNumber: 4, title: 'Mini-Project', content: '' }
          ]
        }))
      };
      
      const learningPath = await LearningPath.create({
        userId: req.user.id,
        topic: topic,
        dreamJob: dreamJob || '',
        category: 'General',
        syllabus: fallbackSyllabus,
        currentUnit: 0,
        currentPhase: 0,
        status: 'created'
      });
      
      return res.json(learningPath);
    }
    
    if (!aiResponse || typeof aiResponse !== 'object') {
      console.error('Invalid AI response type:', typeof aiResponse);
      return res.status(500).json({ message: 'Failed to generate valid syllabus. Please try again.' });
    }
    
    const syllabusData = aiResponse;
    
    const learningPath = await LearningPath.create({
      userId: req.user.id,
      topic: syllabusData.topic || topic,
      dreamJob: dreamJob || '',
      category: syllabusData.category || 'General',
      syllabus: syllabusData,
      currentUnit: 0,
      currentPhase: 0,
      status: 'created'
    });
    
    res.json(learningPath);
  } catch (error) {
    console.error('Syllabus Creation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.startUnit = async (req, res) => {
  try {
    const { pathId, unitNumber } = req.body;
    
    const learningPath = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    if (unitNumber < 0 || unitNumber >= learningPath.syllabus.units.length) {
      return res.status(400).json({ message: 'Invalid unit number' });
    }
    
    learningPath.currentUnit = unitNumber;
    learningPath.currentPhase = 0;
    learningPath.status = 'in_progress';
    await learningPath.save();
    
    res.json(learningPath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.explainPhase = async (req, res) => {
  try {
    const { pathId, unitIndex, phaseIndex } = req.body;
    
    const learningPath = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    const unit = learningPath.syllabus.units[unitIndex];
    const phase = unit.phases[phaseIndex];
    
    const prompt = `Explain in detail the phase: "${phase.title}" from Unit ${unitIndex + 1}: "${unit.title}" of the subject "${learningPath.topic}".
    
    Make it comprehensive and educational with:
    - Detailed explanation with multiple paragraphs
    - Key concepts and definitions
    - Practical examples with code snippets where applicable
    - Step-by-step instructions
    - Common mistakes to avoid
    - Real-world use cases
    - A brief summary
    
    The phase type is determined by the title - adapt the content accordingly:
    - Theory phases: Focus on concepts, definitions, explanations
    - Practice phases: Focus on hands-on exercises, code examples
    - Exercise phases: Focus on problems, solutions, practice questions
    - Project phases: Focus on building something, implementation steps
    
    Return ONLY valid JSON. No markdown, no explanations. Start with { and end with }.
    {
      "title": "${phase.title}",
      "type": "theory|practice|exercise|project",
      "detailedContent": "Comprehensive explanation here with multiple paragraphs...",
      "examples": ["Detailed Example 1", "Detailed Example 2", "Example 3 with code"],
      "codeSnippets": [{"language": "python", "code": "print('hello')"}],
      "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
      "commonMistakes": ["Mistake 1", "Mistake 2"],
      "useCases": ["Use case 1", "Use case 2"],
      "summary": "Brief summary of this phase"
    }`;
    
    console.log('Generating phase explanation:', phase.title);
    const phaseContent = await generateWithAI(
      prompt,
      'You are an expert teacher. Output ONLY valid JSON, no markdown. Start with { and end with }.',
      true
    );
    
    if (!phaseContent || typeof phaseContent !== 'object') {
      return res.status(500).json({ message: 'Failed to generate explanation. Please try again.' });
    }
    
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].content = phaseContent.detailedContent || '';
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].type = phaseContent.type || '';
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].examples = phaseContent.examples || [];
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].codeSnippets = phaseContent.codeSnippets || [];
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].keyConcepts = phaseContent.keyConcepts || [];
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].commonMistakes = phaseContent.commonMistakes || [];
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].useCases = phaseContent.useCases || [];
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].summary = phaseContent.summary || '';
    learningPath.currentPhase = phaseIndex;
    await learningPath.save();
    
    res.json({ 
      phase: phaseContent,
      unitIndex,
      phaseIndex,
      totalPhases: unit.phases.length
    });
  } catch (error) {
    console.error('Phase Explanation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.completePhase = async (req, res) => {
  try {
    const { pathId, unitIndex, phaseIndex } = req.body;
    
    const learningPath = await LearningPath.findOne({ _id: pathId, userId: req.user.id });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    
    learningPath.syllabus.units[unitIndex].phases[phaseIndex].completed = true;
    
    const unit = learningPath.syllabus.units[unitIndex];
    const allPhasesCompleted = unit.phases.every(p => p.completed);
    if (allPhasesCompleted) {
      unit.completed = true;
    }
    
    await learningPath.save();
    
    res.json(learningPath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLearningPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLearningPath = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, userId: req.user.id });
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    res.json(path);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLearningPath = async (req, res) => {
  try {
    await LearningPath.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Learning path deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};