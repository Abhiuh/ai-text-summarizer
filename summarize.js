const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { text, length = 'medium', mode = 'standard', language = 'en' } = body;
    
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Please provide valid text to summarize');
    }

    // Define summary length parameters
    const lengthParams = {
      short: { maxTokens: 250, instruction: 'Create a very concise summary in 1-2 sentences.' },
      medium: { maxTokens: 500, instruction: 'Create a balanced summary capturing main points.' },
      detailed: { maxTokens: 1000, instruction: 'Create a detailed summary with all important points.' }
    };
    
    if (!lengthParams[length]) {
      throw new Error('Invalid summary length specified');
    }

    // Adjust instruction based on mode
    let instruction = lengthParams[length].instruction;
    
    switch(mode) {
      case 'eli5':
        instruction += ' Explain like I\'m 5 years old, using simple language that a child could understand.';
        break;
      case 'factual':
        instruction += ' Focus primarily on factual information and objective statements, avoiding opinions or subjective content.';
        break;
      case 'key-points':
        instruction += ' Format the summary as a list of key points or takeaways from the text.';
        break;
    }
    
    // Add language instruction if not English
    if (language !== 'en' && language !== 'auto') {
      // Map of language codes to language names
      const languageNames = {
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean'
      };
      
      const languageName = languageNames[language] || language.toUpperCase();
      instruction += ` Generate the summary in ${languageName}.`;
    }

    const { maxTokens } = lengthParams[length];
    
    // Get API key from environment variable
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      // For testing without API key, return a mock response
      console.log('GROQ_API_KEY not found, returning mock response');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          summary: "This is a mock summary since the GROQ API key is not configured. Please set up the GROQ_API_KEY environment variable in your Netlify dashboard." 
        })
      };
    }

    // Make request to GROQ API
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    
    const requestBody = {
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a text summarization assistant. ${instruction}`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };

    // Make the API request
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API returned status code ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    // Get the full summary text without truncation
    const summary = data.choices[0].message.content.trim();
    
    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ summary })
    };

  } catch (error) {
    console.error('Error:', error.message);
    const statusCode = error.message.includes('API') ? 502 : 400;
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Failed to summarize text'
      })
    };
  }
};
