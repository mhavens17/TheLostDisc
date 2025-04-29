import { UI } from './uiManager.js';

class StartScreen {
    constructor() {
        this.container = null;
        this.initialized = false;
        this.typingSpeed = 10; // Faster than merchant UI
        this.loreText = [
            "With the Final Broadcast came the Collapse, the death of the internet.",
            "Humanity's hunger for entertainment became insatiable.",
            "The scramble for physical media began.",
            "You are a scavenger of our lost history."
        ];
    }

    initialize() {
        if (this.initialized) return;

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'start-screen';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '2000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        });

        // Create background image
        const background = document.createElement('div');
        Object.assign(background.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundImage: 'url("assets/textures/Opening BG.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: '-1'
        });
        this.container.appendChild(background);

        // Create title container
        const titleContainer = document.createElement('div');
        Object.assign(titleContainer.style, {
            textAlign: 'center',
            marginBottom: '40px'
        });

        // Main title
        const mainTitle = document.createElement('h1');
        mainTitle.textContent = 'Rats of Mars';
        Object.assign(mainTitle.style, {
            color: 'white',
            fontSize: '48px',
            fontFamily: 'monospace',
            marginBottom: '10px',
            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000'
        });

        // Subtitle
        const subtitle = document.createElement('h2');
        subtitle.textContent = 'The Lost Disc';
        Object.assign(subtitle.style, {
            color: 'white',
            fontSize: '36px',
            fontFamily: 'monospace',
            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000'
        });

        titleContainer.appendChild(mainTitle);
        titleContainer.appendChild(subtitle);
        this.container.appendChild(titleContainer);

        // Create play button
        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        Object.assign(playButton.style, {
            padding: '15px 40px',
            fontSize: '24px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
            fontFamily: 'monospace',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        });

        playButton.addEventListener('mouseover', () => {
            playButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        playButton.addEventListener('mouseout', () => {
            playButton.style.backgroundColor = 'transparent';
        });

        playButton.addEventListener('click', () => this.startLoreSequence());
        this.container.appendChild(playButton);

        document.body.appendChild(this.container);
        this.initialized = true;
    }

    async typewriterEffect(element, text) {
        let currentText = '';
        const textSpan = document.createElement('span');
        textSpan.className = 'typing-text';
        
        // Remove cursor element
        element.appendChild(textSpan);

        for (let i = 0; i < text.length; i++) {
            currentText += text[i];
            textSpan.textContent = currentText;
            await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
        }
    }

    async startLoreSequence() {
        // Remove title and play button
        this.container.innerHTML = '';

        // Keep background
        const background = document.createElement('div');
        Object.assign(background.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundImage: 'url("assets/textures/Opening BG.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: '-1'
        });
        this.container.appendChild(background);

        // Create lore container
        const loreContainer = document.createElement('div');
        Object.assign(loreContainer.style, {
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '25px',
            fontWeight: 'bold',
            maxWidth: '80%',
            textAlign: 'center',
            lineHeight: '2',
            textShadow: '4px 4px 6px rgba(0, 0, 0, 0.9)'
        });
        this.container.appendChild(loreContainer);

        // Create skip button
        const skipButton = document.createElement('button');
        skipButton.textContent = 'Skip';
        Object.assign(skipButton.style, {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            fontSize: '18px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
            fontFamily: 'monospace',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        });

        skipButton.addEventListener('mouseover', () => {
            skipButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        skipButton.addEventListener('mouseout', () => {
            skipButton.style.backgroundColor = 'transparent';
        });

        skipButton.addEventListener('click', () => this.startGame());
        this.container.appendChild(skipButton);

        // Type each line of lore text
        for (const line of this.loreText) {
            const lineElement = document.createElement('div');
            loreContainer.appendChild(lineElement);
            await this.typewriterEffect(lineElement, line);
        }

        // Wait 5 seconds after typing is complete, then start the game
        setTimeout(() => this.startGame(), 10000);
    }

    startGame() {
        // Fade out the start screen
        this.container.style.transition = 'opacity 1s';
        this.container.style.opacity = '0';

        // Remove the start screen after fade out
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            this.initialized = false;

            // Dispatch gameStart event
            document.dispatchEvent(new CustomEvent('gameStart'));
        }, 1000);
    }

    show() {
        this.initialize();
    }
}

// Export a singleton instance
export const startScreen = new StartScreen(); 