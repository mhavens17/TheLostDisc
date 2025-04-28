import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { UI } from './uiManager.js';
import { playerState } from './player.js';
import { finalCountdown } from './countdown.js';

// Constants for the Lost Disc
const COLLECTION_DISTANCE_THRESHOLD = 1.0;
const HOVER_HEIGHT = 2.0; // Higher off the ground than normal discs
const COUNTDOWN_DURATION = 120; // 2 minutes in seconds

let lostDisc = null;
let lostDiscModel = null;
let modelLoader = null;
let shepardsFearSound = null;
let normalDiscs = [];

/**
 * Loads the CD model to be used for the Lost Disc
 * @returns {Promise} Promise that resolves when the model is loaded
 */
function loadLostDiscModel() {
    return new Promise((resolve, reject) => {
        if (!modelLoader) {
            modelLoader = new GLTFLoader();
        }
        
        modelLoader.load(
            'assets/models/CD.glb',
            (gltf) => {
                lostDiscModel = gltf.scene.clone();
                
                // Apply red glow effect to the model
                lostDiscModel.traverse((child) => {
                    if (child.isMesh) {
                        // Store original material for reference
                        const originalMaterial = child.material;
                        
                        // Create a new material that preserves the original texture but adds red glow
                        const redGlowMaterial = new THREE.MeshStandardMaterial({
                            map: originalMaterial.map, // Keep original texture
                            emissive: 0xff0000, // Red glow
                            emissiveIntensity: 5,
                            metalness: 0.0,
                            roughness: 1.0
                        });
                        
                        // Apply the new material
                        child.material = redGlowMaterial;
                    }
                });
                
                console.log('✅ Lost Disc model loaded successfully with red glow effect!');
                resolve(lostDiscModel);
            },
            (progress) => {
                // Log loading progress
                if (progress.lengthComputable) {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`📊 Lost Disc model loading progress: ${percentComplete.toFixed(2)}%`);
                }
            },
            (error) => {
                console.error('❌ Error loading Lost Disc model:', error);
                reject(error);
            }
        );
    });
}

/**
 * Creates and places the Lost Disc in the scene.
 * @param {THREE.Scene} scene - The main scene object.
 * @returns {object} Object containing the Lost Disc and check/update functions.
 */
export async function setupLostDisc(scene) {
    // Initialize the sound
    shepardsFearSound = new Audio('assets/sounds/shepards fear.mp3');
    
    // Preload the model
    try {
        await loadLostDiscModel();
    } catch (error) {
        console.error('Failed to load lost disc model:', error);
    }
    
    // Listen for final sequence start
    document.addEventListener('finalSequenceStart', () => {
        console.log('Final sequence started - spawning Lost Disc');
        spawnLostDisc(scene);
    });

    // Add debug key listener for H key
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'h') {
            console.log('Debug key (H) pressed - Triggering final sequence');
            document.dispatchEvent(new CustomEvent('finalSequenceStart'));
        }
    });

    return {
        checkLostDiscCollection,
        animateLostDisc,
        setNormalDiscs
    };
}

/**
 * Store reference to normal collectible discs for removal
 * @param {Array} discs - Array of normal collectible disc meshes
 */
export function setNormalDiscs(discs) {
    normalDiscs = discs;
}

function removeAllNormalDiscs() {
    console.log('Removing all normal discs');
    normalDiscs.forEach(disc => {
        if (disc && disc.parent) {
            disc.parent.remove(disc);
        }
    });
    normalDiscs = [];
}

/**
 * Spawns the Lost Disc at a random location in the game world.
 * @param {THREE.Scene} scene - The main scene object.
 */
function spawnLostDisc(scene) {
    if (lostDisc) return; // Prevent multiple Lost Discs

    // Generate a random position within the game world
    const x = THREE.MathUtils.randFloat(-50, 50);
    const z = THREE.MathUtils.randFloat(-50, 50);
    
    // Use the loaded model
    if (lostDiscModel) {
        lostDisc = lostDiscModel.clone();
        lostDisc.position.set(x, HOVER_HEIGHT, z);
        lostDisc.rotation.x = Math.PI / 2; // This may need adjustment based on model orientation
        
        scene.add(lostDisc);
        console.log('Lost Disc spawned at:', x, HOVER_HEIGHT, z);
        
        // Notify the player with special lost-disc styling
        UI.showText('THE LOST DISC HAS APPEARED', 3000, 'top-center', 'lost-disc');

        // Dispatch event for visual change
        document.dispatchEvent(new CustomEvent('lostDiscEnvironmentChange'));
    } else {
        console.error('Failed to spawn Lost Disc: model not loaded');
    }
}

/**
 * Checks if the player is close enough to collect the Lost Disc.
 * @param {THREE.Vector3} playerPosition - The player's current position.
 */
function checkLostDiscCollection(playerPosition) {
    if (!lostDisc) return;

    const distance = Math.sqrt(
        Math.pow(playerPosition.x - lostDisc.position.x, 2) +
        Math.pow(playerPosition.z - lostDisc.position.z, 2)
    );

    if (distance < COLLECTION_DISTANCE_THRESHOLD) {
        // Remove the Lost Disc
        lostDisc.parent.remove(lostDisc);
        lostDisc = null;
        
        console.log('Lost Disc collected - Starting final countdown');
        finalCountdown.startFinalSequence();
    }
}

/**
 * Animates the Lost Disc with a more dramatic spinning effect.
 * @param {number} time - Current time (e.g., from Date.now() * 0.001).
 */
export function animateLostDisc(time) {
    if (lostDisc) {
        // Spin faster than normal discs
        lostDisc.rotation.z = time * 4;
        
        // Add a slight hovering motion
        lostDisc.position.y = HOVER_HEIGHT + Math.sin(time * 2) * 0.1;
        
        // Add pulsing glow effect by modulating the emissive intensity
        lostDisc.traverse((child) => {
            if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
                // Pulse between 4.0 and 7.0 intensity (more intense than regular discs)
                const pulseFactor = 4.0 + (Math.sin(time * 3) * 1.5 + 1.5);
                child.material.emissiveIntensity = pulseFactor;
                child.material.needsUpdate = true;
            }
        });
    }
} 