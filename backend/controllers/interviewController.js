const InterviewCategory = require('../models/InterviewCategory');
const { generateWithAI } = require('../utils/aiUtils');

const categoryData = {
  communication: {
    title: '💬 Communication Skills',
    description: 'Master verbal communication, storytelling, and articulation for interviews',
    questions: [
      { 
        question: 'Tell me about yourself', 
        overview: 'This is typically the first question in any interview. It sets the tone for the entire conversation.',
        sampleAnswer: 'Start with present (current role), past (how you got here), and future (why this role and where you want to go)...',
        explanation: 'Keep your response between 1-2 minutes. Focus on professional journey, not personal details.',
        examples: ['3 years at XYZ as Senior Developer', 'Led team of 5', 'Built scalable systems'],
        useCases: 'Entry-level interviews, behavioral screenings, initial rounds',
        keyPoints: ['Keep it professional', 'Focus on achievements', 'Connect to the role', 'End with enthusiasm'],
        commonMistakes: ['Talking too long', 'Personal details', 'Reading from resume', 'Being too generic'],
        bestPractices: ['Practice beforehand', 'Time your response', 'Tailor to role', 'Show confidence']
      },
      { 
        question: 'Why do you want to work here?', 
        overview: 'Interviewers want to understand your motivations and if you\'ve done your homework.',
        sampleAnswer: 'Research the company and align your goals with their mission...',
        explanation: 'Show genuine interest by mentioning specific company achievements, culture, or projects.',
        examples: ['Innovation in AI', 'Great work-life balance', 'Market leadership'],
        useCases: 'All interview rounds, especially with hiring managers',
        keyPoints: ['Show research', 'Align values', 'Be specific', 'Show enthusiasm'],
        commonMistakes: ['Generic answers', 'Only salary focus', 'Badmouthing current company', 'No research'],
        bestPractices: ['Visit company website', 'Read recent news', 'Talk to employees', 'Prepare specific reasons']
      },
      { 
        question: 'Describe a challenging situation', 
        overview: ' behavioral question testing problem-solving and resilience.',
        sampleAnswer: 'Use STAR method: Situation, Task, Action, Result...',
        explanation: 'Choose a real challenge where you had control over the outcome.',
        examples: ['Tight deadline project', 'Team conflict', 'Technical debt'],
        useCases: 'Behavioral rounds, manager interviews',
        keyPoints: ['Be honest', 'Show growth', 'Quantify results', 'Focus on actions'],
        commonMistakes: ['Vague answers', 'Blame others', 'No resolution', 'Too simple'],
        bestPractices: ['Choose significant challenge', 'Show your role', 'Highlight lessons', 'Practice STAR']
      },
      { 
        question: 'Where do you see yourself in 5 years?', 
        overview: 'Tests career ambition and alignment with company growth.',
        sampleAnswer: 'Show ambition while being realistic...',
        explanation: 'Align your answer with the company\'s career path and growth opportunities.',
        examples: ['Technical lead', 'Senior engineer', 'Team manager'],
        useCases: 'HR rounds, manager interviews',
        keyPoints: ['Show growth mindset', 'Be realistic', 'Align with company', 'Show learning'],
        commonMistakes: ['Too vague', 'Unrealistic goals', 'Only about money', 'No research'],
        bestPractices: ['Know career paths', 'Show ambition', 'Mention skills', 'Be specific']
      },
      { 
        question: 'What are your strengths and weaknesses?', 
        overview: 'Tests self-awareness and authenticity.',
        sampleAnswer: 'Be authentic, show self-awareness...',
        explanation: 'Choose strengths relevant to the role and weaknesses you\'re working on improving.',
        examples: ['Strength: Problem-solving', 'Weakness: Public speaking (taking classes)'],
        useCases: 'All interview types',
        keyPoints: ['Be authentic', 'Show self-awareness', 'Choose relevant', 'Show improvement'],
        commonMistakes: ['Clichés', 'Weaknesses that are strengths', 'No improvement plan', 'Being arrogant'],
        bestPractices: ['Choose real weaknesses', 'Show improvement', 'Be confident', 'Stay relevant']
      },
      { 
        question: 'Tell me about a time you failed', 
        overview: 'Tests honesty, learning mindset, and growth.',
        sampleAnswer: 'Be honest, show what you learned...',
        explanation: 'Choose a real failure that taught you something valuable.',
        examples: ['Missed deadline', 'Project cancellation', 'Mistake in code'],
        useCases: 'Behavioral interviews, manager rounds',
        keyPoints: ['Be honest', 'Show learning', 'What you changed', 'Take responsibility'],
        commonMistakes: ['No real failure', 'Blame others', 'No learning', 'Being too harsh on self'],
        bestPractices: ['Choose real failure', 'Show growth', 'Explain changes', 'Stay positive']
      },
      { 
        question: 'How do you handle conflict with a coworker?', 
        overview: 'Tests emotional intelligence and conflict resolution.',
        sampleAnswer: 'Discuss specific examples and resolution...',
        explanation: 'Show you can handle disagreements professionally.',
        examples: ['Code review disagreement', 'Deadline conflicts', 'Role confusion'],
        useCases: 'Team interviews, manager rounds',
        keyPoints: ['Stay calm', 'Listen', 'Find solutions', 'Maintain relationships'],
        commonMistakes: ['Badmouthing', 'No resolution', 'Being aggressive', 'Avoiding conflict'],
        bestPractices: ['Give specific example', 'Show empathy', 'Focus on solution', 'Show growth']
      },
      { 
        question: 'Describe your ideal work environment', 
        overview: 'Tests cultural fit and self-awareness.',
        sampleAnswer: 'Balance between collaboration and independence...',
        explanation: 'Align with the company culture while staying authentic.',
        examples: ['Open feedback culture', 'Flexible hours', 'Technical challenges'],
        useCases: 'HR rounds, cultural fit interviews',
        keyPoints: ['Know company culture', 'Be honest', 'Show flexibility', 'Match values'],
        commonMistakes: ['Completely opposite', 'Too rigid', 'Generic answers', 'Ignore company culture'],
        bestPractices: ['Research culture', 'Be authentic', 'Show adaptability', 'Give examples']
      },
      { 
        question: 'What motivates you at work?', 
        overview: 'Understand your intrinsic drivers and fit.',
        sampleAnswer: 'Focus on meaningful work and growth...',
        explanation: 'Show what drives you beyond salary.',
        examples: ['Solving problems', 'Learning new skills', 'Making impact'],
        useCases: 'HR interviews, manager rounds',
        keyPoints: ['Be authentic', 'Show passion', 'Align with role', 'Show depth'],
        commonMistakes: ['Only money', 'No passion', 'Generic answers', 'Copy others'],
        bestPractices: ['Know yourself', 'Give specific examples', 'Show enthusiasm', 'Connect to role']
      },
      { 
        question: 'Why should we hire you?', 
        overview: 'Your sales pitch - why you\'re the best fit.',
        sampleAnswer: 'Combine skills, experience, and passion...',
        explanation: 'Summarize your unique value proposition.',
        examples: ['5 years experience', 'Relevant skills', 'Cultural fit'],
        useCases: 'Final rounds, HR interviews',
        keyPoints: ['Be confident', 'Show value', 'Match requirements', 'Be specific'],
        commonMistakes: ['Arrogant', 'Too generic', 'No evidence', 'Desperate'],
        bestPractices: ['Know job requirements', 'Show evidence', 'Be confident', 'Stay concise']
      }
    ]
  },
  technical: {
    title: '💻 Technical Round',
    description: 'Prepare for coding, problem-solving, and technical questions',
    questions: [
      { 
        question: 'Explain a project you are proud of', 
        overview: 'Showcases your practical experience and achievements.',
        sampleAnswer: 'Use STAR to explain the problem, your solution, and impact...',
        explanation: 'Choose a project that demonstrates relevant skills.',
        examples: ['E-commerce platform', 'Performance optimization', 'ML pipeline'],
        useCases: 'Technical interviews, manager rounds',
        keyPoints: ['Focus on your role', 'Show technical depth', 'Quantify impact', 'Explain challenges'],
        commonMistakes: ['Vague description', 'No metrics', 'Team credit only', 'Outdated projects'],
        bestPractices: ['Choose relevant project', 'Prepare metrics', 'Explain your specific role', 'Practice pitch']
      },
      { 
        question: 'How do you debug a complex issue?', 
        overview: 'Tests problem-solving methodology and tools.',
        sampleAnswer: 'Explain your systematic approach...',
        explanation: 'Show a structured debugging process.',
        examples: ['Log analysis', 'Binary search', 'Documentation'],
        useCases: 'Technical rounds, system design',
        keyPoints: ['Show process', 'Mention tools', 'Explain reasoning', 'Show patience'],
        commonMistakes: ['Random attempts', 'No process', 'Skipping basics', 'Giving up'],
        bestPractices: ['Explain systematically', 'Start with basics', 'Use right tools', 'Document findings']
      },
      { 
        question: 'Design a system for...', 
        overview: 'System design question testing scalability knowledge.',
        sampleAnswer: 'Start with requirements, then high-level design...',
        explanation: 'Show understanding of distributed systems.',
        examples: ['URL shortener', 'Chat system', 'Video streaming'],
        useCases: 'Senior technical interviews, architecture rounds',
        keyPoints: ['Ask clarifying questions', 'Think scalability', 'Consider trade-offs', 'Show depth'],
        commonMistakes: ['No clarification', 'Over-engineering', 'Ignoring constraints', 'No trade-offs'],
        bestPractices: ['Ask questions', 'Start simple', 'Scale gradually', 'Discuss bottlenecks']
      },
      { 
        question: 'Explain time complexity', 
        overview: 'Fundamental CS concept often tested.',
        sampleAnswer: 'Big O notation, common patterns...',
        explanation: 'Be ready to analyze and explain time/space complexity.',
        examples: ['O(1), O(n), O(n²)', 'Binary search O(log n)', 'Hash table O(1)'],
        useCases: 'Coding interviews, CS fundamentals',
        keyPoints: ['Know big O', 'Analyze your code', 'Optimize thinking', 'Practice patterns'],
        commonMistakes: ['Wrong complexity', 'No analysis', 'Ignoring constants', 'Confusing best/worst'],
        bestPractices: ['Always analyze', 'Know common patterns', 'Practice derivation', 'Explain clearly']
      },
      { 
        question: 'Write code for...', 
        overview: 'Live coding test of problem-solving.',
        sampleAnswer: 'Start with brute force, then optimize...',
        explanation: 'Think out loud and test your solution.',
        examples: ['Two sum', 'Reverse linked list', 'Binary tree traversal'],
        useCases: 'Technical coding rounds',
        keyPoints: ['Think out loud', 'Test your code', 'Consider edge cases', 'Optimize'],
        commonMistakes: ['Silent coding', 'No testing', 'Wrong approach', 'Giving up'],
        bestPractices: ['Clarify first', 'Start simple', 'Test thoroughly', 'Optimize if needed']
      },
      { 
        question: 'Explain OOP concepts', 
        overview: 'Object-oriented programming fundamentals.',
        sampleAnswer: 'Encapsulation, Inheritance, Polymorphism, Abstraction...',
        explanation: 'Be ready to explain with examples.',
        examples: ['Class design', 'Inheritance hierarchy', 'Interface usage'],
        useCases: 'Junior/mid-level technical',
        keyPoints: ['Know all 4', 'Give examples', 'Know when to use', 'Show depth'],
        commonMistakes: ['Wrong definitions', 'No examples', 'Confusing concepts', 'Surface level'],
        bestPractices: ['Know definitions', 'Give real examples', 'Explain benefits', 'Show practical use']
      },
      { 
        question: 'What is your debugging process?', 
        overview: 'Shows methodical thinking.',
        sampleAnswer: 'Reproduce → Diagnose → Fix → Verify...',
        explanation: 'Demonstrate systematic approach.',
        examples: ['Console logs', 'Breakpoints', 'Error messages'],
        useCases: 'All technical rounds',
        keyPoints: ['Reproduce issue', 'Isolate problem', 'Fix properly', 'Test thoroughly'],
        commonMistakes: ['Random changes', 'No reproduction', 'No testing', 'Giving up early'],
        bestPractices: ['Reproduce first', 'Use right tools', 'Document findings', 'Verify fix']
      },
      { 
        question: 'Explain databases - SQL vs NoSQL', 
        overview: 'Data storage knowledge.',
        sampleAnswer: 'SQL for structured data with ACID, NoSQL for flexibility...',
        explanation: 'Know when to use each type.',
        examples: ['PostgreSQL vs MongoDB', 'Transactional vs scalable', 'Schema flexibility'],
        useCases: 'Full-stack, backend roles',
        keyPoints: ['Know differences', 'Use cases', 'Scalability', 'Trade-offs'],
        commonMistakes: ['Wrong use cases', 'No trade-offs', 'Missing ACID', 'No practical knowledge'],
        bestPractices: ['Know both', 'Give examples', 'Explain trade-offs', 'Show experience']
      },
      { 
        question: 'How would you optimize a slow API?', 
        overview: 'Performance optimization skills.',
        sampleAnswer: 'Check database queries, caching, indexing...',
        explanation: 'Show end-to-end optimization thinking.',
        examples: ['Add indexes', 'Implement caching', 'Query optimization'],
        useCases: 'Backend, full-stack roles',
        keyPoints: ['Measure first', 'Find bottleneck', 'Optimize strategically', 'Test results'],
        commonMistakes: ['Premature optimization', 'No measurement', 'Wrong focus', 'No testing'],
        bestPractices: ['Profile first', 'Target biggest impact', 'Test changes', 'Monitor results']
      },
      { 
        question: 'Explain REST vs GraphQL', 
        overview: 'API design paradigms.',
        sampleAnswer: 'REST uses endpoints, GraphQL uses single endpoint with queries...',
        explanation: 'Know pros and cons of each.',
        examples: ['REST: /users/:id', 'GraphQL: single endpoint', 'Fetching patterns'],
        useCases: 'API design discussions',
        keyPoints: ['Know both', 'Use cases', 'Trade-offs', 'When to use each'],
        commonMistakes: ['One-sided', 'No trade-offs', 'No practical experience', 'Confusing implementation'],
        bestPractices: ['Compare fairly', 'Give examples', 'Show real use cases', 'Know implementation']
      }
    ]
  },
  body_language: {
    title: '🎭 Body Language & Presentation',
    description: 'Master non-verbal communication and professional presence',
    questions: [
      { 
        question: 'How to maintain eye contact?', 
        overview: 'Non-verbal communication is crucial in interviews.',
        sampleAnswer: 'Maintain eye contact 60-70% of the time...',
        explanation: 'Good eye contact shows confidence and attention.',
        examples: ['Look at all interviewers', 'Natural breaks', 'Smile while talking'],
        useCases: 'All interview types',
        keyPoints: ['60-70% contact', 'Include everyone', 'Don\'t stare', 'Natural smile'],
        commonMistakes: ['No eye contact', 'Staring too long', 'Looking away', 'Only one person'],
        bestPractices: ['Practice beforehand', 'Look at eyes not forehead', 'Take natural breaks', 'Smile genuinely']
      },
      { 
        question: 'What is appropriate handshake?', 
        overview: 'First impression starts with a handshake.',
        sampleAnswer: 'Firm but not too strong, 2-3 seconds...',
        explanation: 'A good handshake sets positive tone.',
        examples: ['Firm grip', 'Eye contact while shaking', '2-3 pumps'],
        useCases: 'In-person interviews',
        keyPoints: ['Firm grip', 'Right duration', 'Eye contact', 'Match energy'],
        commonMistakes: ['Too weak', 'Too strong', 'Too long', 'No eye contact'],
        bestPractices: ['Practice beforehand', 'Match interviewer energy', 'Keep it professional', 'Smile']
      },
      { 
        question: 'How to handle nervousness?', 
        overview: 'Managing anxiety shows emotional intelligence.',
        sampleAnswer: 'Power poses, breathing exercises...',
        explanation: 'Techniques to stay calm before and during interview.',
        examples: ['Deep breathing', 'Power poses', 'Positive visualization'],
        useCases: 'All interview types',
        keyPoints: ['Prepare thoroughly', 'Take deep breaths', 'Remember it\'s a conversation', 'Stay present'],
        commonMistakes: ['Rushing', 'No preparation', 'Negative thoughts', 'Showing anxiety'],
        bestPractices: ['Practice mock interviews', 'Arrive early', 'Use breathing techniques', 'Focus on questions']
      },
      { 
        question: 'What to do with hands during interview?', 
        overview: 'Hand gestures affect perception.',
        sampleAnswer: 'Natural gestures, avoid fidgeting...',
        explanation: 'Use hands naturally for emphasis, avoid nervous habits.',
        examples: ['Hand gestures for emphasis', 'Steady hands', 'Avoid touching face'],
        useCases: 'In-person, video interviews',
        keyPoints: ['Keep visible', 'Natural gestures', 'Avoid fidgeting', 'Relaxed posture'],
        commonMistakes: ['Fidgeting', 'Crossed arms', 'Touching face', 'No movement'],
        bestPractices: ['Stay relaxed', 'Use for emphasis', 'Keep hands visible', 'Practice awareness']
      },
      { 
        question: 'How to sit properly?', 
        overview: 'Posture affects confidence perception.',
        sampleAnswer: 'Straight back, lean slightly forward...',
        explanation: 'Show engagement through posture.',
        examples: ['Upright position', 'Lean forward slightly', 'Feet flat on floor'],
        useCases: 'In-person interviews',
        keyPoints: ['Straight back', 'Lean forward', 'Show engagement', 'Avoid crossed arms'],
        commonMistakes: ['Slouching', 'Crossed arms', 'Leaning back too far', 'Fidgeting in chair'],
        bestPractices: ['Sit upright', 'Lean slightly forward', 'Keep feet steady', 'Show interest']
      },
      { 
        question: 'How to dress for interview?', 
        overview: 'First impression through appearance.',
        sampleAnswer: 'Research company dress code, err on formal side...',
        explanation: 'Dress appropriately for company culture.',
        examples: ['Formal for finance', 'Smart casual for tech', 'Company culture research'],
        useCases: 'All interview types',
        keyPoints: ['Research dress code', 'When in doubt go formal', 'Iron clothes', 'Be neat'],
        commonMistakes: ['Too casual', 'Too formal', 'Unpolished', 'Wrong for company'],
        bestPractices: ['Research company', 'Check LinkedIn photos', 'Prepare outfit', 'Be neat and clean']
      },
      { 
        question: 'How to enter and exit the room?', 
        overview: 'First and last impressions matter.',
        sampleAnswer: 'Confident entrance, smile, make eye contact...',
        explanation: 'Entry and exit leave lasting impressions.',
        examples: ['Knock before entering', 'Wait for seat offer', 'Thank at end'],
        useCases: 'In-person interviews',
        keyPoints: ['Confident entry', 'Make eye contact', 'Good posture', 'Thankful exit'],
        commonMistakes: ['Rushing in', 'No acknowledgment', 'Rushing out', 'No thank you'],
        bestPractices: ['Knock', 'Wait for invitation', 'Make eye contact', 'Thank sincerely']
      },
      { 
        question: 'How to handle virtual interview camera?', 
        overview: 'Video interview etiquette.',
        sampleAnswer: 'Camera at eye level, good lighting, look at camera...',
        explanation: 'Technical setup affects perception.',
        examples: ['Eye level camera', 'Natural light', 'Clean background'],
        useCases: 'Video interviews',
        keyPoints: ['Camera at eye level', 'Good lighting', 'Stable connection', 'Look at camera'],
        commonMistakes: ['Low camera', 'Backlit', 'Distracting background', 'Looking at screen not camera'],
        bestPractices: ['Test tech beforehand', 'Good lighting', 'Stable camera', 'Look at lens']
      },
      { 
        question: 'What facial expressions to use?', 
        overview: 'Facial expressions convey interest.',
        sampleAnswer: 'Show genuine interest through expressions...',
        explanation: 'Match expressions to conversation content.',
        examples: ['Nod when listening', 'Smile when appropriate', 'Show focus'],
        useCases: 'All interview types',
        keyPoints: ['Genuine expressions', 'Nod appropriately', 'Show engagement', 'Match tone'],
        commonMistakes: ['No expression', 'Over-smiling', 'Staring face', 'Frowns'],
        bestPractices: ['Be natural', 'Nod to show understanding', 'Smile genuinely', 'Show focus']
      },
      { 
        question: 'How to use notes during interview?', 
        overview: 'Note-taking can be helpful or distracting.',
        sampleAnswer: 'Keep brief notes, glance don\'t read...',
        explanation: 'Strategic use of notes shows preparation.',
        examples: ['Key points', 'Questions to ask', 'STAR examples'],
        useCases: 'All interview types',
        keyPoints: ['Keep brief', 'Glance don\'t read', 'Natural reference', 'Don\'t rely heavily'],
        commonMistakes: ['Reading verbatim', 'Too many notes', 'No eye contact', 'Distracted by notes'],
        bestPractices: ['Prepare key points', 'Use sparingly', 'Reference naturally', 'Stay engaged']
      }
    ]
  },
  manager_round: {
    title: '👔 Manager/HR Round',
    description: 'Prepare for leadership, cultural fit, and behavioral questions',
    questions: [
      { 
        question: 'Why are you leaving your current job?', 
        overview: 'Common but tricky question about departure.',
        sampleAnswer: 'Focus on growth opportunities, not complaints...',
        explanation: 'Never badmouth previous employers.',
        examples: ['Looking for growth', 'New challenges', 'Career change'],
        useCases: 'HR rounds, manager interviews',
        keyPoints: ['Be positive', 'Focus on future', 'Never badmouth', 'Be honest but tactful'],
        commonMistakes: ['Badmouthing', 'Salary only', 'Complaining', 'Being dishonest'],
        bestPractices: ['Focus on growth', 'Show positivity', 'Keep it brief', 'Be professional']
      },
      { 
        question: 'What is your expected salary?', 
        overview: 'Know your worth and be ready to discuss.',
        sampleAnswer: 'Research market rates, give a range...',
        explanation: 'Be prepared with research and be flexible.',
        examples: ['Market research', 'Range based on experience', 'Open to discussion'],
        useCases: 'HR rounds, final discussions',
        keyPoints: ['Do research', 'Be flexible', 'Know your worth', 'Consider total compensation'],
        commonMistakes: ['Too high', 'Too low', 'No research', 'Being rigid'],
        bestPractices: ['Research market', 'Know your value', 'Give range', 'Consider benefits']
      },
      { 
        question: 'How do you handle conflict?', 
        overview: 'Tests emotional intelligence.',
        sampleAnswer: 'Discuss specific examples and resolution...',
        explanation: 'Show ability to resolve issues professionally.',
        examples: ['Team disagreement', 'Deadline conflicts', 'Code reviews'],
        useCases: 'Manager rounds, team lead interviews',
        keyPoints: ['Show emotional intelligence', 'Focus on resolution', 'Be specific', 'Show growth'],
        commonMistakes: ['No examples', 'Badmouthing', 'No resolution', 'Being aggressive'],
        bestPractices: ['Give specific example', 'Show empathy', 'Focus on solution', 'Show learning']
      },
      { 
        question: 'Tell me about a time you failed', 
        overview: 'Tests honesty and growth mindset.',
        sampleAnswer: 'Be honest, show learning...',
        explanation: 'Choose a real failure with clear learning.',
        examples: ['Missed deadline', 'Project failure', 'Mistake at work'],
        useCases: 'Manager interviews, HR rounds',
        keyPoints: ['Be honest', 'Show growth', 'What you learned', 'What you changed'],
        commonMistakes: ['No real failure', 'Blame others', 'No learning', 'Being too hard on self'],
        bestPractices: ['Choose real failure', 'Show learning', 'Explain changes', 'Stay positive']
      },
      { 
        question: 'What are your expectations from this role?', 
        overview: 'Tests alignment and understanding.',
        sampleAnswer: 'Align with job description and company...',
        explanation: 'Show you\'ve researched and understand the role.',
        examples: ['Learning opportunities', 'Growth path', 'Impact potential'],
        useCases: 'HR rounds, manager interviews',
        keyPoints: ['Research', 'Show enthusiasm', 'Be realistic', 'Align with role'],
        commonMistakes: ['Unrealistic', 'No research', 'Only salary', 'Vague answers'],
        bestPractices: ['Know job description', 'Show genuine interest', 'Be specific', 'Show alignment']
      },
      { 
        question: 'Tell me about a time you showed leadership', 
        overview: 'Tests leadership potential.',
        sampleAnswer: 'Describe situation where you took initiative...',
        explanation: 'Show leadership in any capacity.',
        examples: ['Led a project', 'Mentored junior', 'Initiated improvement'],
        useCases: 'Manager rounds, leadership roles',
        keyPoints: ['Show initiative', 'Impact results', 'Take responsibility', 'Inspire others'],
        commonMistakes: ['No examples', 'Only title', 'No impact', 'Being bossy'],
        bestPractices: ['Choose good example', 'Show results', 'Explain your role', 'Show influence']
      },
      { 
        question: 'How do you prioritize your work?', 
        overview: 'Tests time management skills.',
        sampleAnswer: 'Use Eisenhower matrix, deadlines, impact...',
        explanation: 'Show systematic approach to prioritization.',
        examples: ['Urgent vs important', 'Deadline-based', 'Impact-based'],
        useCases: 'All levels, manager rounds',
        keyPoints: ['Show system', 'Be practical', 'Explain reasoning', 'Show adaptability'],
        commonMistakes: ['No system', 'Random approach', 'No flexibility', 'Only urgency'],
        bestPractices: ['Explain your method', 'Give examples', 'Show flexibility', 'Be practical']
      },
      { 
        question: 'What is your management style?', 
        overview: 'Tests fit with team culture.',
        sampleAnswer: 'Balance between directive and collaborative...',
        explanation: 'Show understanding of different styles.',
        examples: ['Collaborative', 'Servant leader', 'Results-oriented'],
        useCases: 'Management positions',
        keyPoints: ['Know your style', 'Show flexibility', 'Match culture', 'Give examples'],
        commonMistakes: ['No self-awareness', 'One extreme', 'No examples', 'Copy others'],
        bestPractices: ['Know yourself', 'Show flexibility', 'Match team', 'Give examples']
      },
      { 
        question: 'Where do you see yourself in 10 years?', 
        overview: 'Tests long-term career planning.',
        sampleAnswer: 'Show career progression and aspirations...',
        explanation: 'Align with company growth opportunities.',
        examples: ['Executive role', 'Expert track', 'Entrepreneur'],
        useCases: 'HR, manager, senior roles',
        keyPoints: ['Be ambitious', 'Show planning', 'Align with company', 'Be realistic'],
        commonMistakes: ['Too vague', 'Unrealistic', 'No planning', 'Only advancement'],
        bestPractices: ['Show vision', 'Be specific', 'Show growth', 'Align with company']
      },
      { 
        question: 'Do you have any questions for me?', 
        overview: 'Always have thoughtful questions.',
        sampleAnswer: 'Ask about team, growth, challenges...',
        explanation: 'Shows interest and research.',
        examples: ['Team dynamics', 'Growth opportunities', 'Challenges facing team'],
        useCases: 'End of all interviews',
        keyPoints: ['Always ask', 'Be prepared', 'Show interest', 'Research-based'],
        commonMistakes: ['No questions', 'Salary-only', 'Too many', 'No research'],
        bestPractices: ['Prepare 3-5', 'Ask about role', 'Show interest', 'Research company']
      }
    ]
  }
};

exports.generateInterviewContent = async (req, res) => {
  try {
    const { category, customTopic, regenerate } = req.body;
    
    if (!category || !categoryData[category]) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Generate AI content for richer content
    let aiQuestions = [];
    try {
      const prompt = `Generate 5 unique interview questions with detailed answers for ${category} category. 
      For each question provide:
      - question: The interview question
      - overview: Brief overview of what interviewers look for
      - sampleAnswer: A model answer (2-3 sentences)
      - explanation: Detailed explanation of how to answer
      - examples: Real example scenarios
      - useCases: When this question is typically asked
      - keyPoints: 4-5 key points to remember
      - commonMistakes: 4-5 common mistakes to avoid
      - bestPractices: 4-5 best practices
      
      Return ONLY valid JSON array. Focus on ${category === 'communication' ? 'behavioral and HR questions' : category === 'technical' ? 'technical and coding questions' : category === 'body_language' ? 'non-verbal and presentation questions' : 'management and leadership questions'}.`;

      const aiQuestions = await generateWithAI(
        prompt,
        'You are an interview preparation expert. Generate ONLY valid JSON. No markdown.',
        true
      );
      
      if (!Array.isArray(aiQuestions)) aiQuestions = [];
    } catch (e) {
      console.log('AI generation failed, using static content');
    }

    const existing = await InterviewCategory.findOne({ 
      userId: req.user.id, 
      category 
    });

    // Combine static and AI-generated content
    const combinedQuestions = [...categoryData[category].questions];
    if (aiQuestions.length > 0) {
      combinedQuestions.push(...aiQuestions);
    }

    if (existing && !regenerate) {
      existing.questions = combinedQuestions;
      await existing.save();
      return res.json(existing);
    }

    const interviewData = await InterviewCategory.create({
      userId: req.user.id,
      category,
      questions: combinedQuestions
    });

    res.json(interviewData);
  } catch (error) {
    console.error('Interview Generation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getInterviewCategories = async (req, res) => {
  try {
    const categories = await InterviewCategory.find({ userId: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryQuestions = async (req, res) => {
  try {
    const { category } = req.params;
    let interviewData = await InterviewCategory.findOne({ 
      userId: req.user.id, 
      category 
    });

    if (!interviewData) {
      // Generate fresh content with AI
      let aiQuestions = [];
      try {
        const prompt = `Generate 5 unique interview questions with detailed answers for ${category} category.
        For each provide: question, overview, sampleAnswer, explanation, examples (array), useCases, keyPoints (array), commonMistakes (array), bestPractices (array).
        Return valid JSON array only.`;
        
        aiQuestions = await generateWithAI(prompt, 'You are an interview expert. Generate ONLY valid JSON.', true);
        if (!Array.isArray(aiQuestions)) aiQuestions = [];
      } catch (e) {
        // Use static content if AI fails
      }

      const questions = [...(categoryData[category]?.questions || []), ...aiQuestions];
      
      interviewData = await InterviewCategory.create({
        userId: req.user.id,
        category,
        questions
      });
    }

    res.json({
      category: interviewData.category,
      title: categoryData[category]?.title,
      description: categoryData[category]?.description,
      questions: interviewData.questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.togglePracticeComplete = async (req, res) => {
  try {
    const { category, questionIndex } = req.body;
    const interviewData = await InterviewCategory.findOne({ 
      userId: req.user.id, 
      category 
    });

    if (!interviewData) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (questionIndex >= 0 && questionIndex < interviewData.questions.length) {
      interviewData.questions[questionIndex].practiceCompleted = 
        !interviewData.questions[questionIndex].practiceCompleted;
      await interviewData.save();
    }

    res.json(interviewData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNotes = async (req, res) => {
  try {
    const { category, notes } = req.body;
    const interviewData = await InterviewCategory.findOneAndUpdate(
      { userId: req.user.id, category },
      { notes },
      { new: true, upsert: true }
    );
    res.json(interviewData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate more questions for a specific category
exports.generateMoreQuestions = async (req, res) => {
  try {
    const { category, count } = req.body;
    const questionCount = count || 5;
    
    if (!category || !categoryData[category]) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const prompt = `Generate ${questionCount} unique interview questions for ${category} category.
    Each should have: question, overview, sampleAnswer (2-3 sentences), explanation, examples (array of 2-3), useCases, keyPoints (array), commonMistakes (array), bestPractices (array).
    Return JSON array only.`;

    let newQuestions = await generateWithAI(prompt, 'You are an expert interview coach. Generate ONLY valid JSON.', true);
    if (!Array.isArray(newQuestions)) newQuestions = [];

    const existing = await InterviewCategory.findOne({ 
      userId: req.user.id, 
      category 
    });

    if (existing) {
      existing.questions.push(...newQuestions);
      await existing.save();
      return res.json(existing);
    }

    const interviewData = await InterviewCategory.create({
      userId: req.user.id,
      category,
      questions: newQuestions
    });

    res.json(interviewData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};