import { discTrader } from './discTrader.js';
import { UI } from './uiManager.js';

class PlayerState {
    constructor() {
        this._discCount = 0;
        this._money = 0;
        this.position = { x: 0, y: 0, z: 0 };
        this.updateMoneyDisplay(); // Initialize money display
    }

    get discCount() {
        return this._discCount;
    }

    set discCount(value) {
        this._discCount = value;
        // Update the disc counter UI
        const counterElement = document.getElementById('disc-counter');
        if (counterElement) {
            counterElement.textContent = `Discs: ${this._discCount}`;
        }
    }

    get money() {
        return this._money;
    }

    set money(value) {
        this._money = value;
        this.updateMoneyDisplay();
    }

    addMoney(value) {
        // Remove $ sign and convert to number if it's a string
        const amount = typeof value === 'string' ? 
            parseInt(value.replace(/\$/, '')) : 
            value;

        if (!isNaN(amount)) {
            this._money += amount;
            console.log('Added money:', amount, 'New total:', this._money);
            this.updateMoneyDisplay();
        } else {
            console.error('Invalid money value:', value);
        }
    }

    collectDisc() {
        this.discCount++;
        console.log('Player collected disc. New count:', this.discCount);
    }

    updatePosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    updateMoneyDisplay() {
        const moneyElement = document.getElementById('money-counter');
        if (moneyElement) {
            moneyElement.textContent = `Assets: $${this._money}`;
        }
    }
}

// Export a singleton instance
export const playerState = new PlayerState(); 