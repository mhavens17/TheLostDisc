import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Monster {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.isActive = false;
        this.hasBeenSeen = false;
        this.followDistance = 7;
        this.position = new THREE.Vector3();
        this.spawnOffset = new THREE.Vector3(); // Store the initial offset from player
        this.loader = new GLTFLoader();
        
        // Load the monster model
        this.loadMonsterModel();
    }

    loadMonsterModel() {
        console.log(' Attempting to load monster model...');
        this.loader.load(
            'assets/models/the hollow.glb',  // Updated path to include models directory
            (gltf) => {
                this.model = gltf.scene;
                this.model.visible = false; // Hide initially
                this.scene.add(this.model);
                console.log('✅ Monster model loaded successfully!');
                
                // You can add initial setup for animations here
                this.mixer = new THREE.AnimationMixer(this.model);
                this.animations = gltf.animations;
            },
            (progress) => {
                // Log loading progress
                if (progress.lengthComputable) {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`📊 Monster model loading progress: ${percentComplete.toFixed(2)}%`);
                }
            },
            (error) => {
                console.error('❌ Error loading monster model:', error);
                console.log('🔍 Make sure the Monster.glb file exists in the /models directory');
                // Create a simple cube as fallback
                this.createFallbackModel();
            }
        );
    }

    createFallbackModel() {
        console.log('⚠️ Creating fallback cube model for testing...');
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        this.model = new THREE.Mesh(geometry, material);
        this.model.visible = false;
        this.scene.add(this.model);
    }

    spawn(playerPosition, playerDirection) {
        if (!this.model || this.isActive) return;
        
        // Convert position and direction to Vector3
        const positionVector = playerPosition instanceof THREE.Vector3 ? 
            playerPosition.clone() : 
            new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
            
        const directionVector = playerDirection instanceof THREE.Vector3 ? 
            playerDirection.clone() : 
            new THREE.Vector3(playerDirection.x, playerDirection.y, playerDirection.z);
        
        // Calculate spawn position behind player
        const backwardVector = directionVector.normalize().negate();
        const spawnPosition = positionVector.clone().add(
            backwardVector.multiplyScalar(this.followDistance)
        );
        
        // Force the monster to be at ground level
        spawnPosition.y = 0;
        
        // Store the offset from player position for future updates
        this.spawnOffset.copy(spawnPosition).sub(positionVector);
        this.spawnOffset.y = 0; // Ensure offset maintains ground level
        
        this.position.copy(spawnPosition);
        this.model.position.copy(spawnPosition);
        this.model.visible = true;
        this.isActive = true;
        console.log('👻 Monster spawned at position:', {
            x: spawnPosition.x.toFixed(2),
            y: spawnPosition.y.toFixed(2),
            z: spawnPosition.z.toFixed(2)
        });
    }

    update(playerPosition, playerDirection) {
        if (!this.isActive || !this.model) return;

        // Convert position to Vector3
        const positionVector = playerPosition instanceof THREE.Vector3 ? 
            playerPosition.clone() : 
            new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
        
        // Calculate new position using the stored offset
        const targetPosition = positionVector.clone().add(this.spawnOffset);
        targetPosition.y = 0; // Keep at ground level
        
        // Update monster position
        this.position.copy(targetPosition);
        this.model.position.copy(targetPosition);
    }

    triggerJumpscare() {
        if (this.hasBeenSeen) return;
        this.hasBeenSeen = true;
        console.log('😱 Triggering jumpscare effect!');

        // Implement jumpscare effects here
        // Example effects:
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'white';
        flash.style.opacity = '0';
        flash.style.transition = 'opacity 0.1s';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '1000';
        
        document.body.appendChild(flash);
        
        // Flash effect
        requestAnimationFrame(() => {
            flash.style.opacity = '1';
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    flash.remove();
                }, 100);
            }, 50);
        });

        // Play scream sound if available
        // const scream = new Audio('path/to/scream.mp3');
        // scream.play();
    }

    // Calculate if player is looking at monster
    isPlayerLooking(playerPosition, playerForward, angleThreshold = 20) {
        if (!this.isActive) return false;

        // Convert position and direction to Vector3 if they're not already
        const positionVector = playerPosition instanceof THREE.Vector3 ? 
            playerPosition.clone() : 
            new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
            
        const forwardVector = playerForward instanceof THREE.Vector3 ? 
            playerForward.clone() : 
            new THREE.Vector3(playerForward.x, 0, playerForward.z);

        const directionToMonster = this.position.clone().sub(positionVector).normalize();
        const angle = forwardVector.normalize().angleTo(directionToMonster) * (180 / Math.PI);
        
        const isLooking = angle <= angleThreshold;
        if (isLooking && !this.hasBeenSeen) {
            console.log('👀 Player has spotted the monster! Angle:', angle.toFixed(2), 'degrees');
        }
        return isLooking;
    }
}

// Export a factory function to create the monster instance
export function createMonster(scene) {
    return new Monster(scene);
} 