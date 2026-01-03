// ================================
// RAG Chatbot JavaScript
// Handles: Chatbot UI, RAG retrieval, LLM API calls with fallback
// ================================

// ================================
// Knowledge Base - Portfolio Data
// ================================

const KNOWLEDGE_BASE = {
    profile: {
        name: "Nakul Uttarkar",
        role: "Backend Engineer (AI Team)",
        company: "Halodoc",
        email: "nakul.uttarkar@gmail.com",
        phone: "+91-8310105951",
        linkedin: "https://www.linkedin.com/in/nakul-uttarkar-192332216/",
        location: "Bengaluru, Karnataka, India",
        summary: "AI Engineer with 1+ years of hands-on experience in building and deploying LLM-powered systems and multi-agent architectures. Currently working as Backend SDET 1 in the AI/Data Science team at Halodoc."
    },

    experience: [
        {
            title: "Backend Engineer 1 (AI Team)",
            company: "Halodoc Technology",
            duration: "June 2024 - Present",
            location: "Bengaluru",
            highlights: [
                "Engineered scalable LLM gateway microservice supporting 15 LLMs across 80+ production use cases",
                "Optimized OCR extraction workflow boosting accuracy from 88% to 97% with 67% token reduction",
                "Increased auto-adjudication claims from 40% to 70% through prompt tuning and data analysis",
                "Benchmarked and deployed Gemini 2.5 Flash and evaluated Bedrock LLMs for production"
            ],
            technologies: ["Python", "FastAPI", "LLMs", "Prompt Engineering", "Java", "Dropwizard", "Kafka"]
        },
        {
            title: "Backend SDET Intern",
            company: "Halodoc Technology",
            duration: "Feb 2024 - Jun 2024",
            location: "Bengaluru",
            highlights: [
                "Built API automation framework from scratch with 200+ test cases using Java, TestNG, RestAssured",
                "Automated Kafka workflows to validate message flow across microservices",
                "Tested 40+ APIs covering doctor consultations, prescriptions, and medicine orders"
            ],
            technologies: ["Java", "Dropwizard", "TestNG", "Rest-Assured", "Microservices", "Kafka"]
        }
    ],

    projects: [
        {
            name: "Coder Buddy - AI Web App Builder",
            description: "Multi-agent web app generation system using LangGraph and Groq LLMs that autonomously plans, designs, and codes complete web applications from natural language prompts",
            technologies: ["Python", "LangGraph", "Streamlit", "AI Agents", "LLMs"],
            achievements: [
                "Reduced API failure rates by 60% with fault-tolerant fallback mechanism",
                "Maintained 99.9% uptime across distributed AI agents"
            ],
            link: "https://codingpartner-nakul.streamlit.app/"
        },
        {
            name: "AI Interview Assistant",
            description: "HR interview simulator using GPT-4o that conducts adaptive interviews and generates automated performance feedback",
            technologies: ["Python", "Streamlit", "OpenAI GPT-4o"],
            achievements: [
                "Improved candidate evaluation efficiency by 40%",
                "Real-time conversational analysis with structured feedback"
            ],
            link: "https://ai-interview-tool-prototype.streamlit.app/"
        },
        {
            name: "NutriAI",
            description: "AI chatbot for baby health and nutrition guidance with advanced prompt engineering",
            technologies: ["AI Agent", "Prompt Engineering", "LLMs", "Python", "FastAPI", "Kotlin"],
            link: "https://github.com/nakuluttarkar/nutri_ai_bot"
        },
        {
            name: "CIFAR-10 Image Classification",
            description: "CNN model achieving 86.4% accuracy with data augmentation and regularization",
            technologies: ["Python", "PyTorch", "CNN", "Google Colab"],
            link: "https://github.com/nakuluttarkar/cifar10-pytorch-image-classifier"
        }
    ],

    skills: {
        languages: ["Python", "Java", "JavaScript", "C/C++", "HTML/CSS"],
        frameworks: ["Django", "FastAPI", "DropWizard", "TestNG", "Rest Assured"],
        tools: ["Kubernetes", "Docker", "Kafka", "Git", "Maven", "MySQL", "Postman"],
        aiml: [
            "Large Language Models (GPT-4o, Gemini, Claude)",
            "Prompt Engineering",
            "RAG Systems",
            "Machine Learning",
            "Deep Learning",
            "NLP",
            "LangChain",
            "LangGraph",
            "PyTorch"
        ]
    },

    education: {
        degree: "Bachelor of Engineering - Information Science and Engineering",
        institution: "The National Institute of Engineering, Mysuru",
        gpa: "8.63/10",
        year: "2024",
        highlights: "Comprehensive education in Computer Science fundamentals including DSA, OOP, Operating Systems, DBMS, Cloud Computing, Machine Learning and Deep Learning"
    },

    certifications: [
        {
            name: "The AI Engineer Course 2025: Complete AI Engineer Bootcamp",
            provider: "Udemy",
            status: "completed",
            link: "https://www.udemy.com/certificate/UC-6ed4c3f5-ccd0-4ce0-a4c7-bf86fc0f4877/"
        },
        {
            name: "Python and Django Full Stack Web Development",
            provider: "Udemy",
            status: "completed",
            link: "https://www.udemy.com/certificate/UC-2e6a688e-aa2e-4e6c-b5b4-c0b7ff869212/"
        },
        {
            name: "Agentic AI Course",
            provider: "Online",
            status: "in-progress"
        }
    ]
};


// ================================
// RAG Functions - Intelligent Keyword-Based Retrieval
// ================================

// Keyword mappings for intelligent section detection
const SECTION_KEYWORDS = {
    experience: ['experience', 'work', 'job', 'role', 'career', 'employment', 'working', 'worked', 'halodoc', 'position', 'professional', 'company', 'intern', 'internship', 'backend', 'engineer', 'sdet'],
    education: ['education', 'degree', 'university', 'college', 'school', 'study', 'studied', 'graduate', 'gpa', 'engineering', 'nie', 'mysuru', 'academic', 'bachelor', 'b.e'],
    skills: ['skills', 'technologies', 'tech', 'stack', 'programming', 'languages', 'frameworks', 'tools', 'know', 'proficient', 'expertise', 'capable', 'good at', 'python', 'java', 'javascript'],
    projects: ['projects', 'built', 'created', 'developed', 'portfolio', 'work samples', 'coder buddy', 'nutriai', 'interview assistant', 'cifar', 'applications', 'apps'],
    certifications: ['certifications', 'certificates', 'certified', 'courses', 'training', 'udemy', 'learning', 'credentials'],
    profile: ['who', 'about', 'introduction', 'overview', 'summary', 'yourself', 'nakul', 'contact', 'email', 'phone', 'linkedin', 'reach', 'connect', 'location', 'where']
};

// Check if query matches any keywords for a section
function matchesSection(query, sectionType) {
    const queryLower = query.toLowerCase();
    const keywords = SECTION_KEYWORDS[sectionType] || [];
    return keywords.some(keyword => queryLower.includes(keyword));
}

// Get all matching sections based on keywords
function getMatchingSections(query) {
    const matchedTypes = new Set();

    // Check each section type for keyword matches
    for (const sectionType of Object.keys(SECTION_KEYWORDS)) {
        if (matchesSection(query, sectionType)) {
            matchedTypes.add(sectionType);
        }
    }

    // If no specific matches, return all sections (general query)
    if (matchedTypes.size === 0) {
        return ['profile', 'experience', 'skills'];
    }

    return Array.from(matchedTypes);
}

// Build context string for matched sections
function buildContextForSections(sectionTypes) {
    const contextParts = [];

    for (const sectionType of sectionTypes) {
        switch (sectionType) {
            case 'profile':
                contextParts.push(`## Profile Information\n${JSON.stringify(KNOWLEDGE_BASE.profile, null, 2)}`);
                break;
            case 'experience':
                contextParts.push(`## Work Experience\n${JSON.stringify(KNOWLEDGE_BASE.experience, null, 2)}`);
                break;
            case 'education':
                contextParts.push(`## Education\n${JSON.stringify(KNOWLEDGE_BASE.education, null, 2)}`);
                break;
            case 'skills':
                contextParts.push(`## Skills & Technologies\n${JSON.stringify(KNOWLEDGE_BASE.skills, null, 2)}`);
                break;
            case 'projects':
                contextParts.push(`## Projects\n${JSON.stringify(KNOWLEDGE_BASE.projects, null, 2)}`);
                break;
            case 'certifications':
                contextParts.push(`## Certifications\n${JSON.stringify(KNOWLEDGE_BASE.certifications, null, 2)}`);
                break;
        }
    }

    return contextParts.join('\n\n');
}

// Main retrieval function - uses keyword matching for accuracy
function retrieveContext(query) {
    // Get sections that match the query keywords
    const matchedSections = getMatchingSections(query);

    // Always include profile for context
    if (!matchedSections.includes('profile')) {
        matchedSections.unshift('profile');
    }

    // Limit to 4 sections max to keep context manageable
    const sectionsToInclude = matchedSections.slice(0, 4);

    console.log(`Query: "${query}" → Matched sections:`, sectionsToInclude);

    return buildContextForSections(sectionsToInclude);
}


// ================================
// Chatbot State Management
// ================================

let chatbotState = {
    messages: [],
    currentProvider: 'groq',
    isLoading: false
};


// ================================
// LLM API Call with Fallback
// ================================

async function callLLM(provider, systemPrompt, userMessage, retryCount = 0) {
    const maxRetries = 2;

    try {
        // Call the secure Netlify function
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: provider,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Check if we should fallback
        if (data.shouldFallback && retryCount < maxRetries) {
            const fallbackOrder = ['groq', 'openai', 'gemini'];
            const currentIndex = fallbackOrder.indexOf(provider);
            const nextProvider = fallbackOrder[(currentIndex + 1) % fallbackOrder.length];

            console.log(`Falling back from ${provider} to ${nextProvider}...`);
            return await callLLM(nextProvider, systemPrompt, userMessage, retryCount + 1);
        }

        if (data.error) {
            throw new Error(data.error);
        }

        return data.content;

    } catch (error) {
        console.error(`Error with ${provider}:`, error);

        // Try fallback if retries available
        if (retryCount < maxRetries) {
            const fallbackOrder = ['groq', 'openai', 'gemini'];
            const currentIndex = fallbackOrder.indexOf(provider);
            const nextProvider = fallbackOrder[(currentIndex + 1) % fallbackOrder.length];

            console.log(`Falling back from ${provider} to ${nextProvider}...`);
            return await callLLM(nextProvider, systemPrompt, userMessage, retryCount + 1);
        }

        throw new Error('All LLM providers failed. Please try again later or contact me directly at nakul.uttarkar@gmail.com');
    }
}


// ================================
// UI Functions
// ================================

function addMessage(role, content) {
    chatbotState.messages.push({ role, content });
    renderMessages();
}

function renderMessages() {
    const messagesContainer = document.getElementById('chatbotMessages');

    messagesContainer.innerHTML = chatbotState.messages.map(msg => `
    <div class="chat-message ${msg.role}">
      <div class="chat-avatar">${msg.role === 'user' ? '👤' : '🤖'}</div>
      <div class="chat-bubble">${escapeHtml(msg.content)}</div>
    </div>
  `).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showLoading() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'chatLoadingIndicator';
    loadingDiv.className = 'chat-loading';
    loadingDiv.innerHTML = `
    <div class="chat-spinner"></div>
    <span style="color: var(--muted);">Thinking...</span>
  `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideLoading() {
    const loadingIndicator = document.getElementById('chatLoadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ================================
// Send Message Function
// ================================

async function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const sendButton = document.getElementById('chatbotSend');
    const userMessage = input.value.trim();

    if (!userMessage || chatbotState.isLoading) return;

    // Update UI
    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;
    chatbotState.isLoading = true;

    // Add user message
    addMessage('user', userMessage);
    showLoading();

    try {
        // Retrieve relevant context using RAG
        const context = retrieveContext(userMessage);

        // Create system prompt with context
        const systemPrompt = `You are Nakul Uttarkar's AI assistant. Answer questions about Nakul based ONLY on the provided context below. Be conversational, helpful, and concise.

Important guidelines:
- Only use information from the context provided
- If asked about contact info, provide: Email (nakul.uttarkar@gmail.com), Phone (+91-8310105951), LinkedIn
- If information isn't in the context, politely say you don't have that specific information
- Be friendly and professional
- Keep responses under 200 words

Context about Nakul:
${context}`;

        // Call LLM with fallback
        const response = await callLLM(
            chatbotState.currentProvider,
            systemPrompt,
            userMessage
        );

        // Remove loading and add response
        hideLoading();
        addMessage('assistant', response);

    } catch (error) {
        console.error('Chat error:', error);
        hideLoading();
        addMessage('assistant',
            "I'm having trouble connecting right now. Please try again in a moment, or reach out directly via email at nakul.uttarkar@gmail.com"
        );
    } finally {
        // Reset UI
        input.disabled = false;
        sendButton.disabled = false;
        chatbotState.isLoading = false;
        input.focus();
    }
}


// ================================
// Chatbot Event Listeners
// ================================

document.addEventListener('DOMContentLoaded', function () {

    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const providerBtn = document.getElementById('providerBtn');
    const providerMenu = document.getElementById('providerMenu');


    // Toggle chatbot window
    chatbotToggle.addEventListener('click', function () {
        chatbotWindow.classList.add('open');
        chatbotToggle.style.display = 'none';

        // Add welcome message if first time opening
        if (chatbotState.messages.length === 0) {
            addMessage('assistant',
                "👋 Hi! I'm Nakul's AI assistant. I can answer questions about his experience, projects, skills, education, and how to get in touch. What would you like to know?"
            );
        }

        chatbotInput.focus();
    });


    // Close chatbot window
    chatbotClose.addEventListener('click', function () {
        chatbotWindow.classList.remove('open');
        chatbotToggle.style.display = 'flex';
    });


    // Send message on button click
    chatbotSend.addEventListener('click', sendChatMessage);


    // Send message on Enter key
    chatbotInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });


    // Provider selection
    providerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        providerMenu.classList.toggle('open');
    });


    // Handle provider selection
    const providerButtons = providerMenu.querySelectorAll('button');
    providerButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();

            const provider = this.getAttribute('data-provider');
            chatbotState.currentProvider = provider;

            // Update UI
            document.getElementById('providerName').textContent = this.textContent;
            providerButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            providerMenu.classList.remove('open');
        });
    });


    // Close provider menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!providerBtn.contains(e.target) && !providerMenu.contains(e.target)) {
            providerMenu.classList.remove('open');
        }
    });


    // Suggested questions (optional feature)
    const suggestedQuestions = [
        "What's Nakul's experience with LLMs?",
        "Tell me about the Coder Buddy project",
        "What are Nakul's key skills?",
        "How can I contact Nakul?"
    ];

    // You can add these as clickable suggestions in the UI if desired

});


// ================================
// Export for testing (if needed)
// ================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        retrieveContext,
        getMatchingSections,
        buildContextForSections,
        KNOWLEDGE_BASE
    };
}