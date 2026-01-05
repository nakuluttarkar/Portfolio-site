// Vercel Serverless Function Format
// Save this as: api/chat.js

export default async function handler(req, res) {

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { provider, messages } = req.body;

        // Validate input
        if (!provider || !messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        // Get API keys from environment variables
        const apiKeys = {
            groq: process.env.GROQ_API_KEY,
            openai: process.env.OPENAI_API_KEY,
            gemini: process.env.GEMINI_API_KEY
        };

        // Check if API key exists
        if (!apiKeys[provider]) {
            console.error(`API key not found for provider: ${provider}`);
            return res.status(500).json({
                error: `API key not configured for ${provider}`,
                shouldFallback: true
            });
        }

        console.log(`Calling ${provider} API...`);

        // Call appropriate LLM API
        let response;

        if (provider === 'groq') {
            response = await callGroq(apiKeys.groq, messages);
        } else if (provider === 'openai') {
            response = await callOpenAI(apiKeys.openai, messages);
        } else if (provider === 'gemini') {
            response = await callGemini(apiKeys.gemini, messages);
        } else {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            provider: provider,
            content: response
        });

    } catch (error) {
        console.error('Function error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            shouldFallback: true
        });
    }
}

// ================================
// LLM API Functions
// ================================

async function callGroq(apiKey, messages) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', errorText);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('Groq error:', error);
        throw error;
    }
}

async function callOpenAI(apiKey, messages) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('OpenAI error:', error);
        throw error;
    }
}

async function callGemini(apiKey, messages) {
    try {
        // Convert messages to Gemini format
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid Gemini API response format');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Gemini error:', error);
        throw error;
    }
}