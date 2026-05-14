const axios = require('axios');

const extractJSON = (response) => {
  if (!response || typeof response !== 'string') {
    return null;
  }

  let cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // Find the first [ and last ] to extract array
  const firstBrack = cleaned.indexOf('[');
  const lastBrack = cleaned.lastIndexOf(']');
  if (firstBrack !== -1 && lastBrack !== -1 && lastBrack > firstBrack) {
    const arrStr = cleaned.substring(firstBrack, lastBrack + 1);
    try {
      return JSON.parse(arrStr);
    } catch (e) {}
  }

  // Find first { and last } to extract object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const objStr = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(objStr);
    } catch (e) {}
  }

  console.log('extractJSON failed, cleaned:', cleaned.substring(0, 200));
  return null;
};

const generateWithAI = async (prompt, systemPrompt = 'You are a helpful AI assistant.', returnJSON = false) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Try multiple models
  const models = [
    'google/gemini-2.0-flash-001',
    'google/gemini-flash-1.5-8b',
    'meta-llama/llama-3.1-8b-instruct'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-career-backend-k3ql.onrender.com',
            'X-Title': 'AI Career System'
          },
          timeout: 60000 // 60 seconds timeout
        }
      );
      
      console.log(`Model ${model} succeeded`);
      
      if (!response.data.choices || !response.data.choices[0]) {
        throw new Error('Empty response from AI');
      }
      
      const content = response.data.choices[0].message.content;

      if (returnJSON) {
        const parsed = extractJSON(content);
        if (!parsed) {
          console.log(`Model ${model} returned non-JSON response:`, content.substring(0, 200));
          lastError = new Error('Invalid JSON from model');
          continue;
        }
        console.log(`Model ${model} returned valid JSON`);
        return parsed;
      }

      return content;
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
      lastError = error;
      
      const status = error.response?.status;
      
      if (error.code === 'ECONNABORTED' || status === 429 || status === 500 || status === 502 || status === 503) {
        continue;
      }
      
      if (status === 401 || status === 403) {
        console.log('API key issue, trying next model...');
        continue;
      }
    }
  }

  // All models failed
  console.error('All AI models failed. Last error:', lastError?.message);
  throw new Error(lastError?.message || 'All AI models failed. Please try again later.');
};

module.exports = { generateWithAI, extractJSON };