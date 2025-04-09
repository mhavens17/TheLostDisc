import * as THREE from 'three';

const DISC_COUNT = 10; // How many discs to spawn
const DISC_RADIUS = 0.3;
const DISC_THICKNESS = 0.05;
const DISC_SEGMENTS = 16; // Lower poly count
const COLLECTION_DISTANCE_THRESHOLD = 1.0; // How close the player needs to be
const MIN_DISC_DISTANCE = 5; // Minimum distance between discs
const SPAWN_AREA = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 }; // Area to spawn in (matches statues)
const PLAYER_START_POS = new THREE.Vector3(0, 0, 0); // Assuming player starts near origin

let collectedCount = 0;
let discCounterElement = null;
const discs = []; // Array to hold collectible disc objects

// Basic disc material
const discMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }); // Bright yellow, visible from both sides

// Disc Geometry (using Cylinder for flat appearance)
const discGeometry = new THREE.CylinderGeometry(DISC_RADIUS, DISC_RADIUS, DISC_THICKNESS, DISC_SEGMENTS);

/**
 * Creates and places collectible discs in the scene.
 * Sets up the UI counter.
 * @param {THREE.Scene} scene - The main scene object.
 * @param {HTMLElement} uiContainer - The container element for UI.
 * @returns {object} Object containing the discs array and check/update functions.
 */
export function setupCollectibles(scene, uiContainer) {
    collectedCount = 0; // Reset count on setup

    // Create UI counter element
    discCounterElement = document.createElement('div');
    discCounterElement.style.position = 'absolute';
    discCounterElement.style.top = '10px';
    discCounterElement.style.left = '10px';
    discCounterElement.style.color = 'white';
    discCounterElement.style.fontFamily = 'monospace'; // Retro-style font
    discCounterElement.style.fontSize = '24px';
    discCounterElement.style.zIndex = '100'; // Ensure it's above the game canvas
    discCounterElement.textContent = `Discs: ${collectedCount}/${DISC_COUNT}`;
    uiContainer.appendChild(discCounterElement);

    // Generate disc positions
    const discPositions = [];
    while (discPositions.length < DISC_COUNT) {
        const x = THREE.MathUtils.randFloat(SPAWN_AREA.minX, SPAWN_AREA.maxX);
        const z = THREE.MathUtils.randFloat(SPAWN_AREA.minZ, SPAWN_AREA.maxZ);
        const y = 0.5; // Fixed height slightly above the ground
        const potentialPosition = new THREE.Vector3(x, y, z);

        // Check distance from player start
        if (potentialPosition.distanceTo(PLAYER_START_POS) < MIN_DISC_DISTANCE) {
            continue;
        }

        // Check distance from other discs
        let tooClose = false;
        for (const pos of discPositions) {
            if (potentialPosition.distanceTo(pos) < MIN_DISC_DISTANCE) {
                tooClose = true;
                break;
            }
        }
        if (tooClose) {
            continue;
        }

        discPositions.push(potentialPosition);
    }

    // Create and add discs to the scene
    discPositions.forEach(position => {
        const disc = new THREE.Mesh(discGeometry, discMaterial);
        disc.position.copy(position);
        disc.rotation.x = Math.PI / 2; // Lay flat on the ground initially
        scene.add(disc);
        discs.push(disc); // Add to our tracking array
    });

    console.log(`Created ${discs.length} collectible discs.`);

    return {
        discs, // Expose the array for animation
        checkDiscCollection,
        updateDiscCounter // Expose update function if needed elsewhere (though check handles it)
    };
}

/**
 * Checks if the player is close enough to collect any discs.
 * @param {THREE.Vector3} playerPosition - The player's current position.
 */
function checkDiscCollection(playerPosition) {
    if (!discCounterElement) return; // Don't run if UI isn't set up

    for (let i = discs.length - 1; i >= 0; i--) {
        const disc = discs[i];
        // Use XZ distance for collection, ignoring height difference
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - disc.position.x, 2) +
            Math.pow(playerPosition.z - disc.position.z, 2)
        );

        if (distance < COLLECTION_DISTANCE_THRESHOLD) {
            // Collect the disc
            disc.parent.remove(disc); // Remove from scene
            discs.splice(i, 1); // Remove from array
            collectedCount++;
            updateDiscCounter();
            console.log(`Collected disc! Total: ${collectedCount}`);
            // Optional: Play a sound effect here
        }
    }
}

/**
 * Updates the disc counter UI element.
 */
function updateDiscCounter() {
     if (discCounterElement) {
        discCounterElement.textContent = `Discs: ${collectedCount}/${DISC_COUNT}`;
     }
}

/**
 * Animates the discs (spinning).
 * @param {number} time - Current time (e.g., from Date.now() * 0.001).
 */
export function animateCollectibles(time) {
    for (const disc of discs) {
        // Rotate around its local Y-axis (which is world Z if rotation.x is PI/2)
        // Or simply rotate around world Y for a flat spin
        disc.rotation.z = time * 3; // Adjust speed as needed
    }
} 