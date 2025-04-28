import { playerState } from './player.js';

class GameOverScreen {
    constructor() {
        this.container = null;
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

        // Create game over text
        this.gameOverText = document.createElement('h1');
        this.gameOverText.textContent = 'Game Over';
        this.gameOverText.style.color = 'white';
        this.gameOverText.style.fontFamily = 'monospace';
        this.gameOverText.style.fontSize = '48px';
        this.gameOverText.style.marginBottom = '20px';
        this.gameOverText.style.opacity = '0';
        this.gameOverText.style.transition = 'opacity 0.5s ease';

        // Create score text
        this.scoreText = document.createElement('p');
        this.scoreText.style.color = 'white';
        this.scoreText.style.fontFamily = 'monospace';
        this.scoreText.style.fontSize = '24px';
        this.scoreText.style.marginBottom = '30px';
        this.scoreText.style.opacity = '0';
        this.scoreText.style.transition = 'opacity 0.5s ease';

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
        this.playAgainButton.style.transition = 'opacity 0.5s ease, background-color 0.2s ease';

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

        // Add elements to container
        this.container.appendChild(this.gameOverText);
        this.container.appendChild(this.scoreText);
        this.container.appendChild(this.playAgainButton);
        
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
        
        // After 2 seconds, show the text and button
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
        }, 2000);
    }

    hide() {
        if (!this.initialized || !this.container) return;
        
        this.container.style.opacity = '0';
        
        // After transition completes, remove from DOM
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            this.initialized = false;
        }, 500);
    }
}

// Export singleton instance
const gameOverScreen = new GameOverScreen();
export default gameOverScreen; 