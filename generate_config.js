const fs = require('fs');
const path = require('path');

// Read environment variables (from Netlify or local .env)
const config = {
    GROQ_API_KEY: process.env.GROQ_API_KEY || 'your_groq_key_here',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_key_here',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your_gemini_key_here'
};

// Generate the file content
const fileContent = `window.ENV = ${JSON.stringify(config, null, 2)};`;

// Write to config.js
const outputPath = path.join(__dirname, 'config.js');
fs.writeFileSync(outputPath, fileContent);

console.log('✅ config.js generated successfully from environment variables.');
