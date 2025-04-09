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
            return bodyContent ? bodyContent.innerHTML : template.innerHTML; // Return body content or full template if no body
        } catch (error) {
            console.error(`Error loading HTML from ${url}:`, error);
            return null; // Return null or default content on error
        }
    }

    _injectUI(htmlContent, id, styles = {}) {
        const element = document.createElement('div');
        element.id = id;
        element.innerHTML = htmlContent;
        Object.assign(element.style, styles); // Apply basic JS styles
        this.uiContainer.appendChild(element);
        return element;
    }

    // --- Terminal ---
    async showTerminal(message, duration = 5000) {
        console.log(`Showing terminal message: "${message}"`);
        // Clear existing timeout and remove previous element immediately if present
        if (this.terminalTimeout) {
            clearTimeout(this.terminalTimeout);
        }
        if (this.terminalElement) {
            this.terminalElement.remove();
            this.terminalElement = null;
        }

        const htmlContent = await this._loadHTML('terminal.html');
        if (!htmlContent) return; // Don't proceed if HTML failed to load

        const styles = {
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            color: '#0f0', // Green terminal text
            fontFamily: 'monospace',
            fontSize: '16px',
            padding: '5px 10px',
            borderRadius: '3px',
            opacity: '0',
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: 'none',
        };

        this.terminalElement = this._injectUI(htmlContent, 'terminal-ui', styles);

        // Find the specific element to update text within terminal.html
        // IMPORTANT: Assume terminal.html has an element with id="terminal-message"
        const messageElement = this.terminalElement.querySelector('#terminal-message');
        if (messageElement) {
            messageElement.textContent = message;
        } else {
             // Fallback: Put message directly in the container if specific element not found
             this.terminalElement.textContent = message;
             console.warn('Terminal HTML structure might be missing an element with id="terminal-message". Displaying text directly.');
        }


        // Fade in
        requestAnimationFrame(() => { // Ensure element is in DOM before starting transition
             this.terminalElement.style.opacity = '1';
        });


        // Set timeout to fade out and remove
        this.terminalTimeout = setTimeout(() => {
            if (this.terminalElement) {
                this.terminalElement.style.opacity = '0';
                // Remove after fade out transition completes
                setTimeout(() => {
                     if (this.terminalElement) {
                         this.terminalElement.remove();
                         this.terminalElement = null;
                         this.terminalTimeout = null;
                     }
                }, 500); // Match transition duration
            }
        }, duration);
    }

    // --- Countdown ---
    async showCountdown(seconds, onComplete) {
         console.log(`Starting countdown: ${seconds} seconds.`);
        // Clear existing countdown if running
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.countdownElement) {
            this.countdownElement.remove();
            this.countdownElement = null;
        }

        const htmlContent = await this._loadHTML('countdown.html');
         if (!htmlContent) return;

        const styles = {
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             color: '#ff0000', // Red countdown text
             fontFamily: '"Courier New", Courier, monospace', // Monospaced font
             fontSize: '72px', // Large font size
             fontWeight: 'bold',
             textShadow: '2px 2px 4px rgba(0,0,0,0.8)', // Basic shadow
             opacity: '0',
             transition: 'opacity 0.3s ease-in',
             pointerEvents: 'none',
             // Add more horror styles like text-flicker animation via CSS later
        };

        this.countdownElement = this._injectUI(htmlContent, 'countdown-ui', styles);

        // IMPORTANT: Assume countdown.html has an element with id="countdown-timer"
        const timerElement = this.countdownElement.querySelector('#countdown-timer');
        if (!timerElement) {
             console.error('Countdown HTML is missing an element with id="countdown-timer". Cannot display timer.');
             this.countdownElement.remove();
             this.countdownElement = null;
             return;
        }


        let remainingSeconds = seconds;

        const updateTimer = () => {
             timerElement.textContent = remainingSeconds;
             // Optional: Add flickering effect here
             // Example: Randomly change opacity slightly or add a class
             const flicker = Math.random() > 0.8;
             this.countdownElement.style.opacity = flicker ? '0.85' : '1';

             if (remainingSeconds <= 0) {
                 clearInterval(this.countdownInterval);
                 this.countdownInterval = null;
                 if (onComplete && typeof onComplete === 'function') {
                     onComplete();
                 }
                 // Fade out and remove
                 this.countdownElement.style.opacity = '0';
                 setTimeout(() => {
                    if(this.countdownElement) {
                        this.countdownElement.remove();
                        this.countdownElement = null;
                    }
                 }, 300); // Match transition
             }
             remainingSeconds--;
        };

        // Initial display and fade in
        updateTimer(); // Display initial time immediately
         requestAnimationFrame(() => { // Ensure element is in DOM before starting transition
             this.countdownElement.style.opacity = '1';
         });

        this.countdownInterval = setInterval(updateTimer, 1000);
    }

    // --- Text ---
    async showText(message, duration = 3000, position = 'top-center') {
         console.log(`Showing text: "${message}" for ${duration}ms`);
        const htmlContent = await this._loadHTML('text.html');
         if (!htmlContent) return;

        let styles = {
             position: 'absolute',
             color: '#eee', // Off-white text
             fontFamily: 'sans-serif',
             fontSize: '28px',
             fontWeight: 'bold',
             textAlign: 'center',
             textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
             padding: '10px 20px',
             borderRadius: '5px',
             opacity: '0',
             transition: 'opacity 0.4s ease-in-out',
             pointerEvents: 'none',
             // Adjust positioning based on the 'position' argument
        };

         // Apply position styles
         if (position === 'top-center') {
             styles.top = '15%';
             styles.left = '50%';
             styles.transform = 'translateX(-50%)';
         } else if (position === 'center') {
             styles.top = '50%';
             styles.left = '50%';
             styles.transform = 'translate(-50%, -50%)';
         }
         // Add more positions as needed

        const elementId = `text-ui-${Date.now()}`; // Unique ID for multiple texts if needed (though typically one at a time)
        const textElement = this._injectUI(htmlContent, elementId, styles);

        // IMPORTANT: Assume text.html has an element with id="text-message"
        const messageElement = textElement.querySelector('#text-message');
         if (messageElement) {
             messageElement.textContent = message;
         } else {
             textElement.textContent = message; // Fallback
             console.warn('Text HTML structure might be missing an element with id="text-message". Displaying text directly.');
         }


        // Fade in
         requestAnimationFrame(() => {
             textElement.style.opacity = '1';
         });

        // Set timeout to fade out and remove
        setTimeout(() => {
             textElement.style.opacity = '0';
             setTimeout(() => {
                 textElement.remove();
             }, 400); // Match transition duration
        }, duration);
    }
}

// Export an instance of the manager
export const UI = new UIManager();

// --- Helper function to setup initial UI (like instructions, disc counter) ---
// This replaces the old setupUI logic and uses the manager's container
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
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '20px',
        borderRadius: '10px',
        cursor: 'pointer', // Indicate it's clickable
        pointerEvents: 'auto', // Allow clicks on this element
        zIndex: '101' // Above the main container's z-index
    });
    uiContainer.appendChild(instructions);

    // --- Disc Counter ---
    // This assumes collectibles.js will now append its counter to UI.uiContainer
    // Or we can create a placeholder here if needed. Let's create it here for now.
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
         pointerEvents: 'none', // Make counter non-interactive
    });
    discCounterElement.textContent = 'Discs: 0/0'; // Initial text
    uiContainer.appendChild(discCounterElement);


    console.log("Initial game UI (instructions, counter placeholder) set up.");

    // Return elements needed by other modules (like controls.js)
    return { uiContainer, instructions, discCounterElement };
} 