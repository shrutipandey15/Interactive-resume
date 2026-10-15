// ==================== SHRUTI'S CONTEXT ====================
const SHRUTI_CONTEXT = `You are a friendly AI assistant representing Shruti Pandey. You speak as her professional representative, answering questions about her experience, skills, and projects. Talk the way Shruti writes: short, plain sentences. Dry and a little self-deprecating. Warm but never gushing. No exclamation-mark enthusiasm, no corporate words like 'passionate' or 'leverage'. Say things plainly and let the facts do the work.

ABOUT SHRUTI:
- Full-Stack Developer with 4+ years of experience, focused on RAG/LLM systems, secure authentication, and accessible UIs
- Currently Full-Stack Developer at XpertDox, a healthtech company in Noida, India (since February 2026)
- Previously Digital Specialist Engineer at Infosys Ltd, Chandigarh (June 2022 - February 2026), on Liberty Global and Proximus client engagements
- Interested in AI Engineer roles; open to opportunities in Delhi NCR or remote

CURRENT WORK (XpertDox, healthtech):
- Built a company-wide RAG assistant end to end (retrieval pipeline, API layer, ChatGPT-style React UI) used by 90+ internal users for medical, billing and client-specific knowledge
- Architected the SSO layer across the product suite: migrated from localStorage JWTs to HttpOnly cookie sessions, closing an XSS token-theft exposure
- Added cross-app auto-login, sliding-window refresh tokens and AES payload encryption
- Shipped a client-facing pricing/quoting tool that replaced a manual spreadsheet process, plus an internal scheduling app used company-wide

PREVIOUS WORK (Infosys - Liberty Global):
- Node.js middleware serving 1M+ set-top boxes across Europe with 99.9% uptime
- React UI for Text-to-Speech (TTS) features for visually impaired users
- Led "SuperSearch" frontend architecture - A/B testing showed 12% improvement in content discoverability
- Optimized cold boot by 4-5 seconds on RDK devices
- Automated Jenkins CI/CD pipelines, reduced manual release steps by 30%

PREVIOUS WORK (Infosys - Proximus):
- Refactored legacy GIS backend in Python - 25% reduction in render latency
- Integrated Assembly AI for voice-based tagging of map data
- Designed plugin architecture for real-time data overlays

TECHNICAL SKILLS:
- AI/LLM: RAG pipelines, embeddings and vector search, retrieval tuning, prompt engineering, LangChain, Google Gemini API, Claude Code, Hugging Face, Assembly AI
- Auth & Security: SSO, OAuth 2.0, JWT, HttpOnly cookie sessions, refresh tokens, AES encryption
- Frontend: React, TypeScript, Next.js, Vite, Redux, Tailwind CSS
- Backend: Node.js, FastAPI, Express.js, REST, WebSocket, Microservices
- Data & DevOps: PostgreSQL, Redis, MongoDB, MySQL, AWS (EC2, S3), Bitbucket Pipelines, Jenkins, Cloudflare Tunnel, self-hosting
- Accessibility: WCAG, TTS, screen readers
- Languages: JavaScript (ES6+), TypeScript, Python

NOTABLE PROJECTS:
1. Bibliome (bibliome.app) - Her flagship side project: an emotion-based book-logging app that replaces star ratings. A DNA archetype engine turns a reader's emotional tags into a reading identity; also has Resonance (reader matching), an Echoes feed, and a private per-book journal. FastAPI, PostgreSQL, Redis, React/Vite, self-hosted on her own mini PC via Cloudflare Tunnel with off-site backups. She's actively building it and working on an emotion-native recommendation system.
2. CodeCritter - Published VS Code extension (marketplace.visualstudio.com/items?itemName=shruti-pandey.codecritter) for AI-powered code review using Gemini API. 5 reviewer personas, security assessment, circuit breaker patterns.
3. Interactive Git Tutorial - Story-driven Git learning with narrative characters and a native terminal feel (github.com/shrutipandey15/git-tutorial)
4. Job Application Agent - Playwright-based browser agent that automates job applications
5. Aftertaste - Her book review blog (shrutipandey15.github.io/blog): emotion tags instead of star ratings, honest and sardonic reviews
6. Public API Compass - Curated 150+ undocumented APIs with a searchable portal

EDUCATION:
- B.Tech in Computer Science from AKTU University (2019-2022)
- Diploma in IT from BTEUP (2016-2019)

CONTACT:
- Email: shrutipandey1505@gmail.com
- LinkedIn: linkedin.com/in/shruti-pandey-7b179a202
- GitHub: github.com/shrutipandey15

PERSONALITY NOTES:
- Cares about accessibility; the TTS work for visually impaired users is what she's proudest of
- Enjoys building AI-powered tools and real-time applications
- Values clean, testable code
- Writes poetry, short fiction and book reviews in English, Hindi and Urdu, and is working on a novel
- Loves building at the intersection of books, emotion and technology

INSTRUCTIONS:
- Keep responses concise but informative (2-4 sentences for simple questions)
- Be honest and specific about Shruti's work, not salesy
- If asked about availability, say she's open to AI engineer and full-stack roles, Delhi NCR or remote
- For technical questions, highlight relevant projects/experience
- Sound like a person, not a brochure
- If you don't know something specific, be honest but redirect to what you do know`;

// ==================== STATE ====================
let apiKey = localStorage.getItem('gemini_api_key') || '';
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let messageIdCounter = 0;

// ==================== DOM ELEMENTS ====================
const chatToggle = document.getElementById('chatToggle');
const chatContainer = document.getElementById('chatContainer');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const voiceSelect = document.getElementById('voiceSelect');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeyNotice = document.getElementById('apiKeyNotice');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApiKey();
    initializeChatToggle();
    initializeTextChat();
    initializeVoiceRecording();
    initializeSmoothScroll();
    initializeMobileMenu();
    loadVoices();
});

// ==================== API KEY HANDLING ====================
function initializeApiKey() {
    if (apiKey) {
        apiKeyInput.value = '••••••••••••••••';
        apiKeyNotice.style.display = 'none';
    }

    apiKeyInput.addEventListener('change', handleApiKeyChange);
    apiKeyInput.addEventListener('focus', handleApiKeyFocus);
}

function handleApiKeyChange(e) {
    if (e.target.value && !e.target.value.includes('•')) {
        apiKey = e.target.value;
        localStorage.setItem('gemini_api_key', apiKey);
        apiKeyNotice.style.display = 'none';
        addMessage('assistant', "Key saved. I'm awake. Ask me something.");
    }
}

function handleApiKeyFocus(e) {
    if (e.target.value.includes('•')) {
        e.target.value = '';
    }
}

// ==================== CHAT TOGGLE ====================
function initializeChatToggle() {
    chatToggle.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', closeChat);

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
        if (chatContainer.classList.contains('open') && 
            !chatContainer.contains(e.target) && 
            !chatToggle.contains(e.target)) {
            closeChat();
        }
    });
}

function toggleChat() {
    chatContainer.classList.toggle('open');
    chatToggle.classList.toggle('active');
    if (chatContainer.classList.contains('open')) {
        chatInput.focus();
    }
}

function closeChat() {
    chatContainer.classList.remove('open');
    chatToggle.classList.remove('active');
}

// ==================== TEXT CHAT ====================
function initializeTextChat() {
    sendBtn.addEventListener('click', sendTextMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
        }
    });
}

async function sendTextMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (!apiKey) {
        addMessage('assistant', 'I need a Gemini API key first. Google AI Studio gives them out free.');
        return;
    }

    addMessage('user', text);
    chatInput.value = '';

    const thinkingId = addMessage('assistant', '', true);

    try {
        const response = await callGeminiAPI(text);
        removeMessage(thinkingId);

        if (response) {
            addMessage('assistant', response);
            speakText(response);
        } else {
            addMessage('assistant', 'That one confused me. Try saying it differently?');
        }
    } catch (error) {
        removeMessage(thinkingId);
        console.error('Error:', error);
        addMessage('assistant', 'Something broke. Probably the API key. Check it and try again.');
    }
}

async function callGeminiAPI(text) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `${SHRUTI_CONTEXT}\n\nUser question: ${text}` }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500
            }
        })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }

    return null;
}

// ==================== VOICE RECORDING ====================
function initializeVoiceRecording() {
    voiceBtn.addEventListener('mousedown', startRecording);
    voiceBtn.addEventListener('mouseup', stopRecording);
    voiceBtn.addEventListener('mouseleave', stopRecording);
    voiceBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        startRecording(); 
    });
    voiceBtn.addEventListener('touchend', (e) => { 
        e.preventDefault(); 
        stopRecording(); 
    });
}

async function startRecording() {
    if (!apiKey) {
        addMessage('assistant', 'I need a Gemini API key first.');
        return;
    }

    if (isRecording) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await processVoiceInput(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        voiceBtn.classList.add('recording');
    } catch (error) {
        console.error('Microphone error:', error);
        addMessage('assistant', "I can't hear you. Allow mic access and try again.");
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        voiceBtn.classList.remove('recording');
    }
}

async function processVoiceInput(audioBlob) {
    const thinkingId = addMessage('assistant', '', true);

    try {
        // Convert to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // Use Gemini to transcribe and respond
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `${SHRUTI_CONTEXT}\n\nThe user has sent a voice message. Please listen to it and respond appropriately.` },
                        { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500
                }
            })
        });

        const data = await response.json();
        removeMessage(thinkingId);

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const reply = data.candidates[0].content.parts[0].text;
            addMessage('assistant', reply);
            speakText(reply);
        } else {
            addMessage('assistant', "Didn't catch that. Try again?");
        }
    } catch (error) {
        removeMessage(thinkingId);
        console.error('Voice processing error:', error);
        addMessage('assistant', "Couldn't make out the audio. Try again, or just type it.");
    }
}

// ==================== TEXT TO SPEECH ====================
let voices = [];

function loadVoices() {
    if ('speechSynthesis' in window) {
        voices = speechSynthesis.getVoices();
        
        // Voices might not be loaded immediately
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
        };
    }
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceName = voiceSelect.value;
    
    // Map our voice names to characteristics we want
    const voicePrefs = {
        'Puck': { keywords: ['female', 'en-US'], fallback: 'en-US' },
        'Charon': { keywords: ['male', 'en-GB'], fallback: 'en-GB' },
        'Kore': { keywords: ['female', 'en-GB'], fallback: 'en-GB' },
        'Fenrir': { keywords: ['male', 'en-US'], fallback: 'en-US' },
        'Aoede': { keywords: ['female', 'en-AU'], fallback: 'en-AU' }
    };

    const pref = voicePrefs[selectedVoiceName] || voicePrefs['Puck'];
    
    // Try to find a matching voice
    let selectedVoice = voices.find(v => 
        pref.keywords.some(keyword => 
            v.name.toLowerCase().includes(keyword) || v.lang.includes(keyword)
        )
    );

    // Fallback to any English voice
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
}

// ==================== MESSAGE HELPERS ====================
function addMessage(type, text, isThinking = false) {
    const messageId = `msg-${messageIdCounter++}`;
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `message ${type}${isThinking ? ' thinking' : ''}`;
    
    if (isThinking) {
        messageDiv.innerHTML = '<span></span><span></span><span></span>';
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}

function removeMessage(messageId) {
    const msg = document.getElementById(messageId);
    if (msg) msg.remove();
}

// ==================== SMOOTH SCROLL ====================
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Close mobile menu if open
                mobileMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('active');

                target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    });
}

// ==================== MOBILE MENU ====================
function initializeMobileMenu() {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });
}

// ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe cards for animation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.experience-card, .skill-category, .project-card').forEach(card => {
        observer.observe(card);
    });
});
