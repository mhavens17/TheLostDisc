import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { UI } from './uiManager.js';
import { playerState } from './player.js';
import { setNormalDiscs } from './lostDisc.js';
import { soundManager } from './audio.js';

const DISC_COUNT = 20; // Initial disc count
const DISC_RADIUS = 0.3;
const COLLECTION_DISTANCE_THRESHOLD = 1.0;
const MIN_DISC_DISTANCE = 5;
const SPAWN_AREA = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
const PLAYER_START_POS = new THREE.Vector3(0, 0, 0);
const REFILL_THRESHOLD = 5; // Threshold to trigger refill
const REFILL_AMOUNT = 10; // Number of discs to spawn on refill
const ADD_POINT_LIGHTS = true; // Set to false if performance is an issue

let discCounterElement = null;
const discs = [];
let discModel = null;
let modelLoader = null;

/**
 * Loads the CD model to be used for all disc instances
 * @returns {Promise} Promise that resolves when the model is loaded
 */
function loadDiscModel() {
    return new Promise((resolve, reject) => {
        if (!modelLoader) {
            modelLoader = new GLTFLoader();
        }
        
        modelLoader.load(
            'assets/models/CD.glb',
            (gltf) => {
                discModel = gltf.scene.clone();
                // Make the model smaller if needed
                discModel.scale.set(1, 1, 1);
                
                // Add subtle glow effect to the CD model
                discModel.traverse((child) => {
                    if (child.isMesh) {
                        // Store original material for reference
                        const originalMaterial = child.material;
                        
                        // Create a new material that preserves the original texture but adds glow
                        const glowMaterial = new THREE.MeshStandardMaterial({
                            map: originalMaterial.map, // Keep original texture
                            emissive: 0xe38f12, // Subtle blue glow
                            emissiveIntensity: 5,
                            metalness: 0.0,
                            roughness: 1.0
                        });
                        
                        // Apply the new material
                        child.material = glowMaterial;
                    }
                });
                
                console.log('✅ CD model loaded successfully with glow effect!');
                resolve(discModel);
            },
            (progress) => {
                // Log loading progress
                if (progress.lengthComputable) {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`📊 CD model loading progress: ${percentComplete.toFixed(2)}%`);
                }
            },
            (error) => {
                console.error('❌ Error loading CD model:', error);
                reject(error);
            }
        );
    });
}

/**
 * Generates a valid position for a new disc
 * @returns {THREE.Vector3|null} Valid position or null if none found after max attempts
 */
function generateValidDiscPosition() {
    const MAX_ATTEMPTS = 50;
    let attempts = 0;
    
    while (attempts < MAX_ATTEMPTS) {
        const x = THREE.MathUtils.randFloat(SPAWN_AREA.minX, SPAWN_AREA.maxX);
        const z = THREE.MathUtils.randFloat(SPAWN_AREA.minZ, SPAWN_AREA.maxZ);
        const y = 0.5; // Fixed height slightly above the ground
        const potentialPosition = new THREE.Vector3(x, y, z);

        // Check distance from player start
        if (potentialPosition.distanceTo(PLAYER_START_POS) < MIN_DISC_DISTANCE) {
            attempts++;
            continue;
        }

        // Check distance from other discs
        let tooClose = false;
        for (const disc of discs) {
            if (potentialPosition.distanceTo(disc.position) < MIN_DISC_DISTANCE) {
                tooClose = true;
                break;
            }
        }
        
        if (!tooClose) {
            console.log(`Found valid disc position at (${x.toFixed(2)}, ${y}, ${z.toFixed(2)})`);
            return potentialPosition;
        }
        
        attempts++;
    }
    
    console.log(`Failed to find valid position after ${MAX_ATTEMPTS} attempts`);
    return null;
}

/**
 * Spawns a single disc at the specified position
 * @param {THREE.Scene} scene - The scene to add the disc to
 * @param {THREE.Vector3} position - Position to spawn the disc
 */
function spawnDisc(scene, position) {
    // Clone the model for each disc
    const disc = discModel.clone();
    disc.position.copy(position);
    // Keep disc facing up - adjust rotation if needed
    disc.rotation.x = Math.PI / 2; // This may need adjustment based on model orientation
    scene.add(disc);
    discs.push(disc);
    console.log(`Spawned disc at (${position.x.toFixed(2)}, ${position.y}, ${position.z.toFixed(2)})`);
}

/**
 * Checks if more discs need to be spawned and spawns them if necessary
 * @param {THREE.Scene} scene - The scene to add discs to
 */
function checkAndRefillDiscs(scene) {
    if (discs.length <= REFILL_THRESHOLD) {
        console.log(`Disc count (${discs.length}) below threshold, spawning ${REFILL_AMOUNT} new discs`);
        let spawned = 0;
        
        for (let i = 0; i < REFILL_AMOUNT; i++) {
            const position = generateValidDiscPosition();
            if (position) {
                spawnDisc(scene, position);
                spawned++;
            }
        }
        
        if (spawned > 0) {
            console.log(`Successfully spawned ${spawned} new discs. Total discs now: ${discs.length}`);
            setNormalDiscs(discs); // Update reference in lostDisc system
        } else {
            console.log('Failed to spawn any new discs - no valid positions found');
        }
    }
}

/**
 * Updates the disc counter UI element
 */
function updateDiscCounter() {
    if (discCounterElement) {
        discCounterElement.textContent = `Discs: ${playerState.discCount}`;
    }
}

/**
 * Creates and places collectible discs in the scene.
 * Sets up the UI counter.
 * @param {THREE.Scene} scene - The main scene object.
 * @returns {object} Object containing the discs array and check/update functions.
 */
export async function setupCollectibles(scene) {
    playerState.discCount = 0;
    
    discCounterElement = document.getElementById('disc-counter');
    if (!discCounterElement) {
        console.error("Disc counter element (#disc-counter) not found in the DOM. Make sure setupGameUI runs first.");
    } else {
        updateDiscCounter();
    }

    // Load the disc model first
    try {
        await loadDiscModel();
    } catch (error) {
        console.error('Failed to load disc model:', error);
        return { discs: [], checkDiscCollection: () => {}, updateDiscCounter };
    }

    // Generate initial disc positions
    for (let i = 0; i < DISC_COUNT; i++) {
        const position = generateValidDiscPosition();
        if (position) {
            spawnDisc(scene, position);
        }
    }

    console.log(`Created ${discs.length} collectible discs`);
    setNormalDiscs(discs);

    return {
        discs,
        checkDiscCollection,
        updateDiscCounter
    };
}

/**
 * Checks if the player is close enough to collect any discs.
 * @param {THREE.Vector3} playerPosition - The player's current position.
 */
function checkDiscCollection(playerPosition) {
    if (!discCounterElement || discs.length === 0) return;

    let collectedThisFrame = false;
    let sceneRef = null; // Store scene reference

    for (let i = discs.length - 1; i >= 0; i--) {
        const disc = discs[i];
        if (!disc || !disc.parent) {
            discs.splice(i, 1);
            continue;
        }

        // Store scene reference if we haven't yet
        if (!sceneRef && disc.parent) {
            sceneRef = disc.parent;
        }

        const distance = Math.sqrt(
            Math.pow(playerPosition.x - disc.position.x, 2) +
            Math.pow(playerPosition.z - disc.position.z, 2)
        );

        if (distance < COLLECTION_DISTANCE_THRESHOLD) {
            disc.parent.remove(disc);
            discs.splice(i, 1);
            playerState.collectDisc();
            collectedThisFrame = true;
            
            // Play collection sound effect with random pitch
            soundManager.play('collect', { randomPitch: true });
            
            UI.showText('Disc Acquired!', 2000, 'top-center');
        }
    }

    if (collectedThisFrame) {
        updateDiscCounter();
        console.log(`Current disc count: ${discs.length}`); // Debug log
        if (sceneRef) {
            checkAndRefillDiscs(sceneRef);
        }
    }
}

/**
 * Animates the discs (spinning and pulsing glow).
 * @param {number} time - Current time (e.g., from Date.now() * 0.001).
 */
export function animateCollectibles(time) {
    for (const disc of discs) {
        // Rotate the disc
        disc.rotation.z = time * 3;
        
        // Add pulsing glow effect by modulating the emissive intensity
        disc.traverse((child) => {
            if (child.isMesh && child.material && child.material.emissiveIntensity !== undefined) {
                // Pulse between 0.3 and 0.8 intensity
                const pulseFactor = 0.3 + (Math.sin(time * 2) * 0.25 + 0.25);
                child.material.emissiveIntensity = pulseFactor;
                child.material.needsUpdate = true;
            }
        });
        
        // Animate point light if present
        if (disc.userData.light) {
            const pulseFactor = 0.5 + (Math.sin(time * 2) * 0.25 + 0.25);
            disc.userData.light.intensity = pulseFactor;
        }
    }
} 