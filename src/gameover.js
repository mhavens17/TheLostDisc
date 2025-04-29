import { playerState } from './player.js';

class GameOverScreen {
    constructor() {
        this.container = null;
        this.backgroundImage = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'game-over-screen';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'black';
        this.container.style.zIndex = '2000'; // Higher than other UI elements
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.opacity = '0';
        this.container.style.transition = 'opacity 0.5s ease';

        // Create background image container
        this.backgroundImage = document.createElement('div');
        this.backgroundImage.style.position = 'absolute';
        this.backgroundImage.style.top = '0';
        this.backgroundImage.style.left = '0';
        this.backgroundImage.style.width = '100%';
        this.backgroundImage.style.height = '100%';
        this.backgroundImage.style.backgroundImage = 'url("assets/textures/gameover.png")';
        this.backgroundImage.style.backgroundSize = 'cover';
        this.backgroundImage.style.backgroundPosition = 'center';
        this.backgroundImage.style.opacity = '0';
        this.backgroundImage.style.transition = 'opacity 1.5s ease-in-out';
        this.backgroundImage.style.zIndex = '1'; // Behind text elements

        // Create content container for text elements
        this.contentContainer = document.createElement('div');
        this.contentContainer.style.position = 'relative';
        this.contentContainer.style.zIndex = '2'; // Above background image
        this.contentContainer.style.display = 'flex';
        this.contentContainer.style.flexDirection = 'column';
        this.contentContainer.style.alignItems = 'center';
        this.contentContainer.style.justifyContent = 'center';
        this.contentContainer.style.width = '100%';
        this.contentContainer.style.height = '100%';

        // Create game over text
        this.gameOverText = document.createElement('h1');
        this.gameOverText.textContent = 'Game Over';
        this.gameOverText.style.color = 'white';
        this.gameOverText.style.fontFamily = 'monospace';
        this.gameOverText.style.fontSize = '48px';
        this.gameOverText.style.marginBottom = '20px';
        this.gameOverText.style.opacity = '0';
        this.gameOverText.style.transition = 'opacity 0.8s ease-in-out';
        this.gameOverText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';

        // Create score text
        this.scoreText = document.createElement('p');
        this.scoreText.style.color = 'white';
        this.scoreText.style.fontFamily = 'monospace';
        this.scoreText.style.fontSize = '24px';
        this.scoreText.style.marginBottom = '30px';
        this.scoreText.style.opacity = '0';
        this.scoreText.style.transition = 'opacity 0.8s ease-in-out';
        this.scoreText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';

        // Create play again button
        this.playAgainButton = document.createElement('button');
        this.playAgainButton.textContent = 'Play Again';
        this.playAgainButton.style.padding = '10px 20px';
        this.playAgainButton.style.fontSize = '18px';
        this.playAgainButton.style.backgroundColor = 'transparent';
        this.playAgainButton.style.color = 'white';
        this.playAgainButton.style.border = '2px solid white';
        this.playAgainButton.style.fontFamily = 'monospace';
        this.playAgainButton.style.cursor = 'pointer';
        this.playAgainButton.style.opacity = '0';
        this.playAgainButton.style.transition = 'opacity 0.8s ease-in-out, background-color 0.2s ease';
        this.playAgainButton.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';

        // Button hover effects
        this.playAgainButton.addEventListener('mouseover', () => {
            this.playAgainButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        this.playAgainButton.addEventListener('mouseout', () => {
            this.playAgainButton.style.backgroundColor = 'transparent';
        });

        // Add restart functionality
        this.playAgainButton.addEventListener('click', () => {
            this.hide();
            // Reload the page to restart the game
            window.location.reload();
        });

        // Add elements to containers
        this.contentContainer.appendChild(this.gameOverText);
        this.contentContainer.appendChild(this.scoreText);
        this.contentContainer.appendChild(this.playAgainButton);
        
        this.container.appendChild(this.backgroundImage);
        this.container.appendChild(this.contentContainer);
        
        // Add container to document body
        document.body.appendChild(this.container);
        
        this.initialized = true;
    }

    show() {
        this.initialize();
        
        // Update score from player state
        this.scoreText.textContent = `Score: $${playerState.money}`;
        
        // Make the black screen visible immediately
        this.container.style.opacity = '1';
        
        // After 3 seconds, fade in the background image
        setTimeout(() => {
            this.backgroundImage.style.opacity = '1';
            
            // After 4 seconds total (1 second after background starts fading in), show the text elements
            setTimeout(() => {
                this.gameOverText.style.opacity = '1';
                
                // After a short delay, show the score
                setTimeout(() => {
                    this.scoreText.style.opacity = '1';
                    
                    // After another short delay, show the button
                    setTimeout(() => {
                        this.playAgainButton.style.opacity = '1';
                    }, 300);
                }, 300);
            }, 1000);
        }, 3000);
    }

    hide() {
        if (!this.initialized || !this.container) return;
        
        // Fade out all elements
        this.container.style.opacity = '0';
        this.backgroundImage.style.opacity = '0';
        this.gameOverText.style.opacity = '0';
        this.scoreText.style.opacity = '0';
        this.playAgainButton.style.opacity = '0';
        
        // After transition completes, remove from DOM
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            this.initialized = false;
        }, 1500);
    }
}

// Export singleton instance
const gameOverScreen = new GameOverScreen();
export default gameOverScreen; 