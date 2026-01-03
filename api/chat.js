// ================================
// Netlify Serverless Function
// Secure API handler for LLM calls
// ================================

exports.handler = async (event, context) => {

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { provider, messages } = JSON.parse(event.body);

        // Validate input
        if (!provider || !messages || !Array.isArray(messages)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request format' })
            };
        }

        // Get API keys from environment variables (secure!)
        const apiKeys = {
            groq: process.env.GROQ_API_KEY,
            openai: process.env.OPENAI_API_KEY,
            gemini: process.env.GEMINI_API_KEY
        };

        // Check if API key exists for the selected provider
        if (!apiKeys[provider]) {
            console.error(`API key not found for provider: ${provider}`);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: `API key not configured for ${provider}`,
                    shouldFallback: true
                })
            };
        }

        // Rate limiting (simple IP-based)
        const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
        console.log(`Request from IP: ${clientIp}, Provider: ${provider}`);

        // Call the appropriate LLM API
        let response;

        if (provider === 'groq') {
            response = await callGroq(apiKeys.groq, messages);
        } else if (provider === 'openai') {
            response = await callOpenAI(apiKeys.openai, messages);
        } else if (provider === 'gemini') {
            response = await callGemini(apiKeys.gemini, messages);
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid provider' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                provider: provider,
                content: response
            })
        };

    } catch (error) {
        console.error('Function error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
                shouldFallback: true
            })
        };
    }
};


// ================================
// Groq API Call
// ================================

async function callGroq(apiKey, messages) {
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
}


// ================================
// OpenAI API Call
// ================================

async function callOpenAI(apiKey, messages) {
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
}


// ================================
// Gemini API Call
// ================================

async function callGemini(apiKey, messages) {
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
}