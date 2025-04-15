import { discTrader } from './discTrader.js';
import { UI } from './uiManager.js';

class PlayerState {
    constructor() {
        this._discCount = 0;
        this._money = 0;
        this.position = { x: 0, y: 0, z: 0 };
        this.forward = { x: 0, y: 0, z: -1 }; // Default forward direction
        this.monster = null; // Reference to monster instance
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

        // Update monster position if active
        if (this.monster && this.monster.isActive) {
            this.monster.update(this.position, this.forward);
            this.checkMonsterVisibility();
        }
    }

    updateForwardDirection(x, y, z) {
        this.forward = { x, y, z };
    }

    setMonsterReference(monster) {
        this.monster = monster;
    }

    spawnMonster() {
        if (this.monster && !this.monster.isActive) {
            this.monster.spawn(this.position, this.forward);
        }
    }

    checkMonsterVisibility() {
        if (!this.monster || !this.monster.isActive) return;

        if (this.monster.isPlayerLooking(this.position, this.forward)) {
            this.monster.triggerJumpscare();
        }
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