import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MerchantUI from './merchant.js';

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
        
        this.loadModel();
        console.log('Merchant machine initialized at position:', this.position);
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

        // Only trigger UI changes when the state changes
        if (this.isPlayerInRange !== wasInRange) {
            if (this.isPlayerInRange) {
                console.log('Player entered merchant machine radius');
                this.merchantUI.show();
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