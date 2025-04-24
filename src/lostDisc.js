import * as THREE from 'three';
import { UI } from './uiManager.js';
import { playerState } from './player.js';
import { finalCountdown } from './countdown.js';

// Constants for the Lost Disc
const LOST_DISC_RADIUS = 0.4; // Slightly larger than normal discs
const LOST_DISC_THICKNESS = 0.05;
const LOST_DISC_SEGMENTS = 32; // Higher detail than normal discs
const COLLECTION_DISTANCE_THRESHOLD = 1.0;
const HOVER_HEIGHT = 2.0; // Higher off the ground than normal discs
const COUNTDOWN_DURATION = 120; // 2 minutes in seconds

// Create a glowing red material for the Lost Disc
const lostDiscMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.DoubleSide
});

// Disc Geometry
const lostDiscGeometry = new THREE.CylinderGeometry(
    LOST_DISC_RADIUS,
    LOST_DISC_RADIUS,
    LOST_DISC_THICKNESS,
    LOST_DISC_SEGMENTS
);

let lostDisc = null;
let shepardsFearSound = null;
let normalDiscs = [];

/**
 * Creates and places the Lost Disc in the scene.
 * @param {THREE.Scene} scene - The main scene object.
 * @returns {object} Object containing the Lost Disc and check/update functions.
 */
export function setupLostDisc(scene) {
    // Initialize the sound
    shepardsFearSound = new Audio('assets/sounds/shepards fear.mp3');
    
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
    
    lostDisc = new THREE.Mesh(lostDiscGeometry, lostDiscMaterial);
    lostDisc.position.set(x, HOVER_HEIGHT, z);
    lostDisc.rotation.x = Math.PI / 2; // Lay flat
    
    scene.add(lostDisc);
    console.log('Lost Disc spawned at:', x, HOVER_HEIGHT, z);
    
    // Notify the player
    UI.showText('The Lost Disc has appeared!', 3000, 'top-center');

    // Dispatch event for visual change
    document.dispatchEvent(new CustomEvent('lostDiscEnvironmentChange'));
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
        lostDisc.rotation.z = time * 4; // Spin faster than normal discs
        // Add a slight hovering motion
        lostDisc.position.y = HOVER_HEIGHT + Math.sin(time * 2) * 0.1;
    }
} 