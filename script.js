/*
  File: script.js
  Description: This file handles the interactivity of our chat interface.
  It now sends messages to our live backend and displays the response.
  (This file has been updated)
*/

// --- DOM Element References ---
const messageArea = document.getElementById('message-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// The URL of our FastAPI backend
//const BACKEND_URL = 'http://127.0.0.1:8000';

// --- Event Listeners ---

/**
 * Handles the submission of the message form.
 * It prevents the default form submission, gets the user's message,
 * displays it, and now sends it to the backend for a real response.
 */
messageForm.addEventListener('submit', async (event) => {
    // Prevent the page from reloading
    event.preventDefault();

    // Get the message text from the input field
    const messageText = messageInput.value.trim();

    // If the message is not empty, process it
    if (messageText !== '') {
        // 1. Add the user's message to the chat window
        addMessage(messageText, 'user');

        // 2. Clear the input field and disable the form while waiting for a response
        messageInput.value = '';
        messageInput.focus();
        sendButton.disabled = true;

        // 3. Send the message to the backend and get the response
        try {
            const botResponse = await getBotResponse(messageText);
            addMessage(botResponse, 'bot');
        } catch (error) {
            console.error("Error fetching bot response:", error);
            addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
        } finally {
            // 4. Re-enable the send button
            sendButton.disabled = false;
        }
    }
});


// --- Functions ---

/**
 * Creates and appends a new chat message to the message area.
 * @param {string} text - The text content of the message.
 * @param {string} sender - Who sent the message ('user' or 'bot').
 */
function addMessage(text, sender) {
    // Create the main container for the message
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message', `${sender}-message`, 'mb-4', 'flex');
    if (sender === 'user') {
        messageContainer.classList.add('justify-end');
    }

    // Create the message bubble
    const bubble = document.createElement('div');
    bubble.classList.add('rounded-lg', 'p-3', 'max-w-md');
    bubble.textContent = text;

    if (sender === 'user') {
        bubble.classList.add('bg-blue-500', 'text-white');
    } else {
        bubble.classList.add('bg-gray-200', 'text-gray-800');
        
        // Add the bot avatar
        const avatarContainer = document.createElement('div');
        avatarContainer.classList.add('flex-shrink-0', 'h-10', 'w-10', 'rounded-full', 'bg-gray-300', 'flex', 'items-center', 'justify-center', 'mr-3');
        avatarContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`;
        messageContainer.appendChild(avatarContainer);
    }

    // Append the bubble to the container and the container to the message area
    messageContainer.appendChild(bubble);
    messageArea.appendChild(messageContainer);

    // Automatically scroll to the bottom to show the latest message
    messageArea.scrollTop = messageArea.scrollHeight;
}

/**
 * Sends the user's message to the backend API and returns the response.
 * @param {string} userMessage - The message the user sent.
 * @returns {Promise<string>} The bot's reply.
 */
async function getBotResponse(userMessage) {
    // Show a "typing" indicator immediately for better UX
    const typingIndicator = showTypingIndicator();

    try {
        //const response = await fetch(`${BACKEND_URL}/chat`, {
        const response = await fetch(`/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply; // The backend returns a JSON with a "reply" key

    } finally {
        // Always remove the typing indicator
        hideTypingIndicator(typingIndicator);
    }
}

/**
 * Displays a temporary "typing..." message from the bot.
 * @returns {HTMLElement} The typing indicator element.
 */
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.classList.add('chat-message', 'bot-message', 'mb-4', 'flex');
    typingIndicator.innerHTML = `
        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <div class="bg-gray-200 text-gray-800 rounded-lg p-3 max-w-xs">
            <p class="typing-dots"><span>.</span><span>.</span><span>.</span></p>
        </div>
    `;
    messageArea.appendChild(typingIndicator);
    messageArea.scrollTop = messageArea.scrollHeight;
    return typingIndicator;
}

/**
 * Removes the typing indicator from the chat.
 * @param {HTMLElement} indicator - The typing indicator element to remove.
 */
function hideTypingIndicator(indicator) {
    if (indicator) {
        indicator.remove();
    }
}
