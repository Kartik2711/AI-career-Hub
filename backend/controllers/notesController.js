const Note = require('../models/Note');
const { generateWithAI } = require('../utils/aiUtils');

exports.generateNote = async (req, res) => {
  try {
    const { topic, dreamJob } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const prompt = `Generate comprehensive, detailed study notes about "${topic}" for ${dreamJob || 'a software professional'}.
    
    Analyze the topic and generate appropriate content. The topic could be:
    - A programming language (Python, Java, JavaScript, Go, Rust, etc.)
    - A technology/framework (React, Angular, Node.js, Django, etc.)
    - A concept (CI/CD, DevOps, Machine Learning, Cloud Computing, etc.)
    - A domain (Data Science, Cybersecurity, Blockchain, etc.)
    - A tool (Docker, Kubernetes, Git, AWS, etc.)
    - A methodology (Agile, Scrum, Waterfall, etc.)
    - Any other technical or professional topic
    
    Make the notes EXTENSIVE and detailed - this should be like a full lesson/chapter. Include:
    - Deep explanations with multiple sub-sections
    - Many practical examples (at least 5-7 with code snippets where applicable)
    - Real-world use cases (at least 4-5)
    - Key points and takeaways (at least 10-12)
    - Common mistakes to avoid (at least 4)
    - Best practices (at least 5)
    - Summary
    
    IMPORTANT: If "${topic}" relates to DevOps, cloud, infrastructure, or operations, make sure to include CI/CD pipelines, deployment strategies, and related tools.
    
    Return ONLY valid JSON (no markdown, no extra text) with this structure:
    {
      "topic": "${topic}",
      "category": "Detect appropriate category like: Programming Language, Web Framework, DevOps, Data Science, Cloud, Database, etc.",
      "content": {
        "overview": "Brief overview of what this topic is about",
        "detailedExplanation": "Comprehensive explanation with sub-sections, in-depth details (write in multiple paragraphs)",
        "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
        "relatedTopics": ["Related topic 1", "Related topic 2", "Related topic 3"],
        "examples": ["Detailed Example 1 with code/illustration", "Detailed Example 2", "Detailed Example 3", "Example 4", "Example 5", "Example 6", "Example 7"],
        "useCases": ["Use case 1 - real world application", "Use case 2", "Use case 3", "Use case 4", "Use case 5"],
        "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5", "Key point 6", "Key point 7", "Key point 8", "Key point 9", "Key point 10", "Key point 11", "Key point 12"],
        "commonMistakes": ["Mistake 1 to avoid", "Mistake 2", "Mistake 3", "Mistake 4"],
        "bestPractices": ["Best practice 1", "Best practice 2", "Best practice 3", "Best practice 4", "Best practice 5"],
        "toolsAndTechnologies": ["Tool/Technology 1", "Tool/Technology 2"],
        "summary": "Final summary of the topic"
      }
    }`;
    
    console.log('Generating detailed notes for topic:', topic);
    let noteData;
    try {
      noteData = await generateWithAI(
        prompt,
        'You are an expert educational content creator. Generate ONLY valid JSON. No markdown, no explanations. Start with { and end with }.',
        true
      );
    } catch (aiError) {
      console.error('AI Error:', aiError.message);
      return res.status(500).json({ message: 'Failed to generate notes. Please try again.' });
    }
    
    if (!noteData || typeof noteData !== 'object') {
      console.error('Invalid AI response:', noteData);
      return res.status(500).json({ message: 'Failed to generate valid notes. Please try again.' });
    }
    
    const note = await Note.create({
      userId: req.user.id,
      topic: noteData.topic || topic,
      content: noteData.content,
      category: noteData.category || 'General'
    });
    
    res.json(note);
  } catch (error) {
    console.error('Note Generation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};