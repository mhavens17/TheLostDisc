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
        
        // Boundary values (will be set via setBoundary)
        this.boundary = {
            minX: -50, // Default values (will be overridden)
            maxX: 50,
            minZ: -50,
            maxZ: 50
        };
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

    /**
     * Set boundary limits based on ground plane dimensions
     * @param {Object} ground - The ground plane mesh
     * @param {number} padding - Optional padding inside the boundary (default: 0)
     */
    setBoundary(ground, padding = 0) {
        // OVERRIDE: Instead of using the actual ground dimensions (which are now 150x150),
        // we're manually setting the boundary to the original 100x100 dimensions
        
        // Original boundary calculation from ground dimensions:
        // const width = ground.geometry.parameters.width;
        // const height = ground.geometry.parameters.height;
        
        // Hard-code to original dimensions (100x100)
        const width = 100;
        const height = 100;
        
        // Calculate boundaries with optional padding
        this.boundary = {
            minX: -(width / 2) + padding,  // -50 + padding
            maxX: (width / 2) - padding,   // +50 - padding
            minZ: -(height / 2) + padding, // -50 + padding
            maxZ: (height / 2) - padding   // +50 - padding
        };
        
        // Add a record of the original boundary values for reference
        this.originalBoundary = {
            xRange: "±50",
            zRange: "±50",
            actualMinX: -50 + padding,
            actualMaxX: 50 - padding,
            actualMinZ: -50 + padding,
            actualMaxZ: 50 - padding
        };
        
        console.log('Player boundaries set:', this.boundary);
    }

    /**
     * Clamp the position to stay within boundaries
     * @param {number} x - The unclamped X position
     * @param {number} z - The unclamped Z position
     * @returns {Object} The clamped position {x, z}
     */
    clampPositionToBoundary(x, z) {
        const clampedX = Math.max(this.boundary.minX, Math.min(this.boundary.maxX, x));
        const clampedZ = Math.max(this.boundary.minZ, Math.min(this.boundary.maxZ, z));
        
        return { x: clampedX, z: clampedZ };
    }

    updatePosition(x, y, z) {
        // Clamp the position to the boundary
        const clampedPosition = this.clampPositionToBoundary(x, z);
        
        // Update position with clamped values
        this.position.x = clampedPosition.x;
        this.position.y = y;
        this.position.z = clampedPosition.z;

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