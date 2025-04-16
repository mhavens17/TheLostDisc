import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { UI } from './uiManager.js';  // Import UI manager
import { discTrader } from './discTrader.js';
import { playerState } from './player.js';

export class MerchantMachine {
    constructor(scene, playerPosition) {
        this.scene = scene;
        this.machine = null;
        this.interactionRadius = 2; // 5 units radius for interaction
        this.position = new THREE.Vector3(
            playerPosition.x + 5, // Offset from player
            0, // On the ground
            playerPosition.z + 5
        );
        this.isPlayerInRange = false;
        this.merchantUI = null;  // Initialize as null
        this.currentDiscData = null;
        this.lastKnownDiscCount = 0;
        this._hasLoggedLoading = false; // Flag for logging control
        
        this.loadModel();
        this.setupKeyListener();
        this.initializeMerchantUI();  // Start initialization
        console.log('Merchant machine initialized at position:', this.position);

        // Listen for final sequence
        document.addEventListener('finalSequenceStart', () => {
            this.remove();
        });
    }

    async initializeMerchantUI() {
        // Wait for UI.merchantUI to be available
        const checkUI = async () => {
            if (UI.merchantUI) {
                this.merchantUI = UI.merchantUI;
                console.log('MerchantUI successfully initialized');
            } else {
                console.log('Waiting for MerchantUI to initialize...');
                await new Promise(resolve => setTimeout(resolve, 100));
                await checkUI();
            }
        };
        await checkUI();
    }

    setupKeyListener() {
        this.keyHandler = (event) => {
            if (event.key.toLowerCase() === 'c' && discTrader.canTradeDiscs()) {
                console.log('Trade key pressed while in range');
                
                // Check if merchantUI is available
                if (!this.merchantUI) {
                    console.log('MerchantUI not yet initialized');
                    return;
                }

                // Store the current disc's value before trading
                const currentValue = this.currentDiscData ? this.currentDiscData.value : null;
                
                const newDiscData = discTrader.tradeDisc();
                console.log('Trade result:', newDiscData);
                
                if (currentValue) {
                    // Add money from the traded disc
                    playerState.addMoney(currentValue);
                }

                if (newDiscData) {
                    console.log('Updating merchant UI with new disc data');
                    this.currentDiscData = newDiscData;
                    this.merchantUI.update(this.currentDiscData);
                } else {
                    // If we have no more discs after trading, show the no-discs UI
                    this.merchantUI.show(null);
                    this.currentDiscData = null;
                }
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }

    async loadModel() {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('assets/models/Machine.glb');
            this.machine = gltf.scene;
            this.machine.position.copy(this.position);
            this.scene.add(this.machine);
            console.log('Merchant machine model loaded successfully');
        } catch (error) {
            console.error('Error loading merchant machine model:', error);
        }
    }

    getPosition() {
        return this.position;
    }

    checkPlayerProximity(playerPosition) {
        if (!this.machine) {
            if (!this._hasLoggedLoading) {
                console.log('Machine model not yet loaded, skipping proximity check');
                this._hasLoggedLoading = true;
            }
            return;
        }

        // Once machine is loaded, reset the flag for future use if needed
        this._hasLoggedLoading = false;

        // Check if merchantUI is available
        if (!this.merchantUI) {
            console.log('MerchantUI not yet initialized, skipping UI updates');
            return;
        }

        const distance = this.position.distanceTo(new THREE.Vector3(
            playerPosition.x,
            this.position.y,
            playerPosition.z
        ));

        const wasInRange = this.isPlayerInRange;
        this.isPlayerInRange = distance <= this.interactionRadius;

        // Update trading ability based on proximity
        if (this.isPlayerInRange) {
            discTrader.enableTrading();
        } else {
            discTrader.disableTrading();
        }

        // Check if player just got their first disc
        const justGotFirstDisc = this.lastKnownDiscCount === 0 && playerState.discCount > 0;
        this.lastKnownDiscCount = playerState.discCount;

        // Only trigger UI changes when the state changes
        if (this.isPlayerInRange !== wasInRange) {
            if (this.isPlayerInRange) {
                console.log('Player entered merchant machine radius');
                console.log('Current disc count:', playerState.discCount);
                
                if (playerState.discCount > 0) {
                    // Generate new data only if we don't have current data or just got first disc
                    if (!this.currentDiscData || justGotFirstDisc) {
                        this.currentDiscData = discTrader.generateNewDisc();
                        console.log('Generated new disc data:', this.currentDiscData);
                    } else {
                        console.log('Using existing disc data:', this.currentDiscData);
                    }
                    this.merchantUI.show(this.currentDiscData);
                } else {
                    // Show the no-discs UI instead of hiding
                    console.log('No discs available, showing alternate UI');
                    this.merchantUI.show(null);
                }
            } else {
                console.log('Player left merchant machine radius');
                this.merchantUI.hide();
            }
        }
    }

    remove() {
        if (this.machine) {
            this.scene.remove(this.machine);
            this.machine = null;
        }
        if (this.merchantUI) {
            this.merchantUI.hide();
            // Remove merchant UI from DOM
            const merchantElement = document.querySelector('.merchant-ui');
            if (merchantElement) {
                merchantElement.remove();
            }
        }
        // Remove event listener
        document.removeEventListener('keydown', this.keyHandler);
        console.log('Merchant machine and UI removed from scene');
    }
}

// Helper function to check if a position is too close to the machine
export function isNearMachine(position, machinePosition, minDistance = 3) {
    if (!machinePosition) return false;
    
    const distance = new THREE.Vector3(
        position.x,
        machinePosition.y,
        position.z
    ).distanceTo(machinePosition);
    
    return distance < minDistance;
} 