import { UI } from './uiManager.js';

class FinalCountdown {
    constructor() {
        this.shepardsFearSound = new Audio('assets/sounds/shepards fear.mp3');
        this.isActive = false;
    }

    startFinalSequence() {
        if (this.isActive) return;
        this.isActive = true;

        // Clear all UI elements except countdown
        document.querySelectorAll('#game-ui-container > *').forEach(element => {
            if (!element.classList.contains('countdown-ui')) {
                element.remove();
            }
        });

        // Start 2-minute countdown
        UI.showCountdown(120, () => {
            console.log("Countdown finished - Spawning monster");
            document.dispatchEvent(new CustomEvent('spawnMonster'));
        });

        // Play Shepard's Fear after 45 seconds
        setTimeout(() => {
            console.log("Playing Shepard's Fear");
            this.shepardsFearSound.play().catch(error => {
                console.error("Error playing Shepard's Fear:", error);
            });
        }, 15000);
    }
}

export const finalCountdown = new FinalCountdown(); 