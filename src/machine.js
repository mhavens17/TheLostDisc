import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MerchantUI from './merchant.js';
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
        this.merchantUI = new MerchantUI();
        this.currentDiscData = null;
        this.lastKnownDiscCount = 0;
        
        this.loadModel();
        this.setupKeyListener();
        console.log('Merchant machine initialized at position:', this.position);
    }

    setupKeyListener() {
        this.keyHandler = (event) => {
            if (event.key.toLowerCase() === 'c' && discTrader.canTradeDiscs()) {
                console.log('Trade key pressed while in range');
                
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
            console.log('Machine model not yet loaded, skipping proximity check');
            return;
        }

        const distance = this.position.distanceTo(new THREE.Vector3(
            playerPosition.x,
            this.position.y,
            playerPosition.z
        ));

        //console.log('Distance to machine:', distance, 'Radius:', this.interactionRadius);

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