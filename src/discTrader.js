import { generateMusicEntry } from './musicGenerator.js';
import { UI } from './uiManager.js';
import { playerState } from './player.js';

class DiscTrader {
    constructor() {
        this.currentDiscData = null;
        this._canTrade = false;
    }

    getDiscCount() {
        return playerState.discCount;
    }

    enableTrading() {
        this._canTrade = true;
    }

    disableTrading() {
        this._canTrade = false;
    }

    canTradeDiscs() {
        return this._canTrade && playerState.discCount > 0;
    }

    updateDiscCounter() {
        const counterElement = document.getElementById('disc-counter');
        if (counterElement) {
            counterElement.textContent = `Discs: ${playerState.discCount}`;
        }
    }

    generateNewDisc() {
        console.log('Attempting to generate new disc. Current count:', playerState.discCount);
        if (playerState.discCount > 0) {
            this.currentDiscData = generateMusicEntry();
            console.log('Generated new disc data:', this.currentDiscData);
            return this.currentDiscData;
        }
        console.log('No discs available for generation');
        return null;
    }

    tradeDisc() {
        console.log('Attempting to trade disc. Can trade:', this._canTrade, 'Count:', playerState.discCount);
        if (this._canTrade && playerState.discCount > 0) {
            // Decrease the player's disc count
            playerState.discCount--;
            this.updateDiscCounter();
            const newDisc = this.generateNewDisc();
            console.log('Traded disc. New count:', playerState.discCount);
            return newDisc;
        }
        console.log('Trade failed: trading disabled or no discs available');
        return null;
    }
}

export const discTrader = new DiscTrader(); 