class UIManager {
    constructor() {
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'game-ui-container';
        this.uiContainer.style.position = 'fixed';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
        this.uiContainer.style.zIndex = '100'; // Ensure UI is on top
        document.body.appendChild(this.uiContainer);

        this.terminalElement = null;
        this.terminalTimeout = null;
        this.countdownInterval = null;
        this.countdownElement = null;
        
        // Initialize merchant UI immediately
        this.merchantUI = null;
        this.initializeMerchantUI();

        console.log("UIManager initialized.");
    }

    async _loadHTML(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            // Find the body content, assuming the HTML files have a body tag
            const bodyContent = template.content.querySelector('body');
            // We want the *content* of the body, not the body tag itself
            return bodyContent ? bodyContent.innerHTML : template.innerHTML; 
        } catch (error) {
            console.error(`Error loading HTML from ${url}:`, error);
            return null; // Return null or default content on error
        }
    }

    // InjectUI: Creates a wrapper div, adds base class, injects HTML content
    _injectUI(htmlContent, instanceId, baseClass) {
        const element = document.createElement('div');
        element.id = instanceId; // Unique ID for this specific instance
        element.classList.add(baseClass); // Base class from HTML file (e.g., 'terminal-ui')
        element.innerHTML = htmlContent; // The HTML loaded from the file
        this.uiContainer.appendChild(element);
        return element;
    }

    // --- Terminal ---
    async showTerminal(message, duration = 5000) {
        console.log(`Showing terminal message: "${message}"`);
        // Clear existing timeout and remove previous element immediately
        if (this.terminalTimeout) {
            clearTimeout(this.terminalTimeout);
            if (this.terminalElement) this.terminalElement.remove();
            this.terminalElement = null;
        }

        const htmlContent = await this._loadHTML('terminal.html');
        if (!htmlContent) return;

        // Inject HTML content into a new div with 'terminal-ui' class
        this.terminalElement = this._injectUI(htmlContent, 'terminal-ui-instance', 'terminal-ui');

        // Find the specific element within the injected HTML to update text
        const messageElement = this.terminalElement.querySelector('#terminal-message');
        if (messageElement) {
            messageElement.textContent = message;
        } else {
            // Fallback if #terminal-message is missing in terminal.html
            this.terminalElement.textContent = message; 
            console.warn('Terminal HTML structure might be missing #terminal-message.');
        }

        // Fade in using CSS class transition
        requestAnimationFrame(() => {
            setTimeout(() => { // Timeout ensures transition is triggered
                if (this.terminalElement) this.terminalElement.classList.add('active');
            }, 10);
        });

        // Set timeout to fade out (remove class) and then remove element from DOM
        this.terminalTimeout = setTimeout(() => {
            if (this.terminalElement) {
                this.terminalElement.classList.remove('active');
                // Remove from DOM after transition (match CSS transition duration)
                setTimeout(() => {
                    if (this.terminalElement) {
                        this.terminalElement.remove();
                        this.terminalElement = null;
                        this.terminalTimeout = null;
                    }
                }, 500); // Match transition duration in terminal.html CSS
            }
        }, duration);
    }

    // --- Countdown ---
    async showCountdown(seconds, onComplete) {
        console.log(`Starting countdown: ${seconds} seconds.`);
        // Clear existing interval and remove previous element immediately
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            if (this.countdownElement) this.countdownElement.remove();
            this.countdownElement = null;
            this.countdownInterval = null; // Clear interval ID
        }

        const htmlContent = await this._loadHTML('countdown.html');
        if (!htmlContent) return;

        // Inject HTML content into a new div with 'countdown-ui' class
        this.countdownElement = this._injectUI(htmlContent, 'countdown-ui-instance', 'countdown-ui');

        // Find the specific element within the injected HTML
        const timerElement = this.countdownElement.querySelector('#countdown-timer');
        if (!timerElement) {
            console.error('Countdown HTML is missing #countdown-timer.');
            if (this.countdownElement) this.countdownElement.remove();
            this.countdownElement = null;
            return;
        }

        let remainingSeconds = seconds;

        const updateTimer = () => {
            timerElement.textContent = remainingSeconds;
            // CSS animation handles flicker if defined in countdown.html

            if (remainingSeconds <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                if (onComplete && typeof onComplete === 'function') {
                    onComplete();
                }
                // Fade out by removing class
                if (this.countdownElement) {
                    this.countdownElement.classList.remove('active');
                    // Remove from DOM after transition (match CSS transition duration)
                    setTimeout(() => {
                        if (this.countdownElement) {
                            this.countdownElement.remove();
                            this.countdownElement = null;
                        }
                    }, 300); // Match transition duration in countdown.html CSS
                }
            }
            remainingSeconds--;
        };

        // Initial display and fade in
        updateTimer(); // Set initial time
        requestAnimationFrame(() => {
            setTimeout(() => { // Ensure transition triggers
                if (this.countdownElement) this.countdownElement.classList.add('active');
            }, 10);
        });

        this.countdownInterval = setInterval(updateTimer, 1000);
    }

    // --- Text ---
    async showText(message, duration = 3000, position = 'top-center') {
        console.log(`Showing text: "${message}" for ${duration}ms`);
        const htmlContent = await this._loadHTML('text.html');
        if (!htmlContent) return;

        const elementId = `text-ui-${Date.now()}`; // Unique ID for potential multiple texts
        // Inject HTML content into a new div with 'text-ui' class
        const textElement = this._injectUI(htmlContent, elementId, 'text-ui');
        textElement.classList.add(position); // Add position class (e.g., 'top-center')

        // Find the specific element within the injected HTML
        const messageElement = textElement.querySelector('#text-message');
        if (messageElement) {
            messageElement.textContent = message;
        } else {
            textElement.textContent = message; // Fallback
            console.warn('Text HTML structure might be missing #text-message.');
        }

        // Fade in using class
        requestAnimationFrame(() => {
            setTimeout(() => { // Ensure transition triggers
                textElement.classList.add('active');
            }, 10);
        });

        // Set timeout to fade out (remove class) and remove element
        setTimeout(() => {
            textElement.classList.remove('active');
            // Remove from DOM after transition (match CSS transition duration)
            setTimeout(() => {
                textElement.remove(); // Remove this specific instance
            }, 400); // Match transition duration in text.html CSS
        }, duration);
    }

    async initializeMerchantUI() {
        if (!this.merchantUI) {
            const MerchantUI = (await import('./merchant.js')).default;
            this.merchantUI = new MerchantUI();
            // Don't show initial merchant UI anymore - it will be controlled by proximity
        }
    }

    updateMerchantUI(discData) {
        if (this.merchantUI) {
            this.merchantUI.update(discData);
        }
    }

    hideMerchantUI() {
        if (this.merchantUI) {
            this.merchantUI.hide();
        }
    }
}

// Export an instance of the manager
export const UI = new UIManager();

// --- Helper function to setup initial UI (like instructions, disc counter) ---
// This uses direct element creation/styling, so it remains unchanged.
export function setupGameUI(initialInstructionsText = "Click to Start") {
    const uiContainer = UI.uiContainer; // Use the manager's container

    // --- Initial Instructions ---
    const instructions = document.createElement('div');
    instructions.id = 'instructions'; // Keep ID for potential use by controls.js
    instructions.textContent = initialInstructionsText;
    Object.assign(instructions.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '36px',
        fontFamily: 'monospace',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)', // Keep bg for instructions
        padding: '20px',
        borderRadius: '10px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        zIndex: '101'
    });
    uiContainer.appendChild(instructions);

    // --- Disc Counter ---
    const discCounterElement = document.createElement('div');
    discCounterElement.id = 'disc-counter'; // ID for collectibles.js to find
    Object.assign(discCounterElement.style, {
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '24px',
        zIndex: '101',
        pointerEvents: 'none',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)' // Add shadow for readability
    });
    discCounterElement.textContent = 'Discs: 0/0'; // Initial text
    uiContainer.appendChild(discCounterElement);

    console.log("Initial game UI (instructions, counter placeholder) set up.");

    // Return elements needed by other modules
    return { uiContainer, instructions, discCounterElement };
} 