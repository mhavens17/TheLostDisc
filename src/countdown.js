import { UI } from './uiManager.js';
import { soundManager } from './audio.js';

class FinalCountdown {
    constructor() {
        this.isActive = false;
        this.monsterSpawned = false;
        
        // Add event listener for monster spawn
        document.addEventListener('spawnMonster', () => {
            this.monsterSpawned = true;
        });
    }

    startFinalSequence() {
        if (this.isActive) return;
        this.isActive = true;
        this.monsterSpawned = false;

        // Start 2-minute countdown
        UI.showCountdown(120, () => {
            console.log("Countdown finished - Zero reached");
            // The monster spawn will be triggered automatically 13 seconds after reaching zero
            // This is now handled by the UIManager.showCountdown method
        });

        // Play Shepard's Fear after 30 seconds
        setTimeout(() => {
            console.log("Playing Shepard's Fear");
            soundManager.play('shepardsFear', { volume: 0.9 });
        }, 30000);
    }
}

export const finalCountdown = new FinalCountdown(); 