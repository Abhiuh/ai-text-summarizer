const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY is not set in .env file');
    process.exit(1);
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PORT = 3000;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for summarization
app.post('/summarize', async (req, res) => {
    console.log('Handling /summarize API request');
    
    try {
        const { text, length = 'medium' } = req.body;
        
        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Please provide valid text to summarize');
        }

        // Get mode and other parameters from the request body
        const mode = req.body.mode || 'standard';
        const language = req.body.language || 'en';

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
        
        console.log('Making request to GROQ API...');
        
        // Create a promise to handle the Groq API response
        const groqResponse = await new Promise((resolve, reject) => {
            let responseData = '';
            
            const groqRequest = https.request(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            groqRequest.on('response', response => {
                response.on('data', chunk => {
                    responseData += chunk;
                });

                response.on('end', () => {
                    if (response.statusCode === 200) {
                        resolve(responseData);
                    } else {
                        reject(new Error(`API returned status code ${response.statusCode}: ${responseData}`));
                    }
                });
            });

            groqRequest.on('error', error => {
                console.error('Request error:', error.message);
                reject(new Error('Failed to connect to the API'));
            });

            // Prepare and send the request
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

            const requestBodyStr = JSON.stringify(requestBody);
            groqRequest.write(requestBodyStr);
            groqRequest.end();
        });

        console.log('Received response from GROQ API');
        
        // Parse the response
        const groqData = JSON.parse(groqResponse);

        if (!groqData.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from API');
        }

        // Get the full summary text without truncation
        const summary = groqData.choices[0].message.content.trim();
        
        // Send successful response
        res.json({ summary });
        console.log('Successfully sent summary response');

    } catch (error) {
        console.error('Error:', error.message);
        const statusCode = error.message.includes('API') ? 502 : 400;
        res.status(statusCode).json({ 
            error: error.message || 'Failed to summarize text'
        });
    }
});

// Handle all other routes by serving index.html (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Access on your network at http://<your-ip-address>:${PORT}`);
});
