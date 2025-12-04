// ==================== SHRUTI'S CONTEXT ====================
const SHRUTI_CONTEXT = `You are a friendly AI assistant representing Shruti Pandey. You speak as her professional representative, answering questions about her experience, skills, and projects. Be warm, helpful, and conversational. A bit witty but in hilarious ways!.

ABOUT SHRUTI:
- Full-Stack Developer specializing in AI integration, performance optimization, and Accessibility (a11y)
- Currently Digital Specialist Engineer at Infosys Ltd, Chandigarh, India (since June 2022)
- Built production systems serving 1M+ users, reduced latencies by 25%, prototyped LLM-driven search interfaces

CURRENT WORK (Liberty Global):
- Develops Node.js middleware serving 1M+ set-top boxes across Europe with 99.9% uptime
- Engineers React UI for Text-to-Speech (TTS) features for visually impaired users
- Led "SuperSearch" frontend architecture - A/B testing showed 12% improvement in content discoverability
- Optimized cold boot by 4-5 seconds on RDK devices
- Automated Jenkins CI/CD pipelines, reduced manual steps by 30%
- Improved test coverage by 20% with Mocha/Chai

PREVIOUS WORK (Proximus):
- Refactored legacy GIS backend in Python - 25% reduction in render latency
- Integrated Assembly AI for voice-based tagging of map data
- Designed plugin architecture for real-time data overlays

TECHNICAL SKILLS:
- Frontend: React, Redux, TypeScript, Next.js, Tailwind CSS, SASS
- Backend: Node.js, FastAPI, Express.js, REST API, Microservices, WebSocket
- AI/ML: LLMs, LangChain, RAG Pipelines, TensorFlow, PyTorch, Hugging Face, Google Gemini
- Accessibility: TTS, WCAG Standards, Web Audio API
- Databases: MongoDB, MySQL
- DevOps: Docker, Git, Jenkins, AWS (EC2, S3), CI/CD
- Languages: JavaScript (ES6+), Python, TypeScript, C++

NOTABLE PROJECTS:
1. CodeCritter - Published VS Code extension for AI-powered code review using Gemini API. Features 5 reviewer personas, security assessment, circuit breaker patterns.
2. Moment Creator - Real-time lyric sync app with WebSockets and Assembly AI
3. Public API Compass - Curated 150+ undocumented APIs with searchable portal
4. bookLovin - Full-stack MERN social media for book lovers

EDUCATION:
- B.Tech in Computer Science from AKTU University (2019-2022)
- Diploma in IT from BTEUP (2016-2019)

CONTACT:
- Email: shrutipandey1505@gmail.com
- LinkedIn: linkedin.com/in/shruti-pandey-7b179a202
- GitHub: github.com/shrutipandey15

PERSONALITY NOTES:
- Passionate about accessibility and creating inclusive digital experiences
- Enjoys building AI-powered tools and real-time applications
- Values clean, testable code
- Creative mindset - also writes novels in spare time!

INSTRUCTIONS:
- Keep responses concise but informative (2-4 sentences for simple questions)
- Be enthusiastic about Shruti's work
- If asked about availability, mention she's open to new opportunities
- For technical questions, highlight relevant projects/experience
- Be friendly and conversational, not robotic
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
        addMessage('assistant', 'API key saved! You can now chat with me. Try asking about Shruti\'s experience or click the mic to talk! 🎉');
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
        addMessage('assistant', 'Please enter your Gemini API key first! Get one free at Google AI Studio.');
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
            addMessage('assistant', 'I had trouble processing that. Could you try rephrasing?');
        }
    } catch (error) {
        removeMessage(thinkingId);
        console.error('Error:', error);
        addMessage('assistant', 'Oops! Something went wrong. Please check your API key and try again.');
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
        addMessage('assistant', 'Please enter your Gemini API key first!');
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
        addMessage('assistant', 'Could not access microphone. Please allow microphone access and try again.');
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
            addMessage('assistant', 'I couldn\'t understand that. Could you try again?');
        }
    } catch (error) {
        removeMessage(thinkingId);
        console.error('Voice processing error:', error);
        addMessage('assistant', 'Had trouble processing your voice. Please try again or type your question.');
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