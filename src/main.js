import * as THREE from 'three';
import { setupControls } from './controls.js';
import { setupEnvironment } from './environment.js';
// import { setupCollectibles } from './collectibles.js'; // Removed
import { setupCollectibles, animateCollectibles } from './collectible.js'; // Import new functions
import { createTwigs } from './twigs.js';
import { createStatues } from './statue.js';
import { setupAudio } from './audio.js';
// import { setupUI } from './ui.js'; // Old import
import { UI, setupGameUI } from './uiManager.js'; // Import from new manager
import { MerchantMachine, isNearMachine } from './machine.js';
import { createMonster } from './monster.js';
import { playerState } from './player.js';
import { setupLostDisc, animateLostDisc } from './lostDisc.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer setup with low resolution for PS1 effect
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(320, 240); // Low resolution for PS1 effect
renderer.setPixelRatio(1); // Force 1:1 pixel ratio
document.body.appendChild(renderer.domElement);

// Scale up the canvas while maintaining pixelation
renderer.domElement.style.width = '100vw';
renderer.domElement.style.height = '100vh';

// Set up UI first to get instructions element
const { instructions } = setupGameUI();

// Set up controls with instructions
const { controls, moveSpeed, keys, velocity } = setupControls(camera, instructions);
scene.add(controls.getObject());

// Create merchant machine early
let merchantMachine = new MerchantMachine(scene, controls.getObject().position);
console.log('Created merchant machine at start');

// Example Terminal Messages
const terminalMessages = [
    "SYSTEM SCAN INITIATED...",
    "Anomaly detected in Sector 7G.",
    "WARNING: Entity proximity increasing.",
    "Memory corruption detected.",
    "\nERROR: UNKNOWN ORIGIN\nSIGNAL LOST...", // Example with newline
    "Searching for lost signal...",
    "Atmospheric pressure dropping.",
    "Is anybody out there?",
    "SECURITY ALERT: Perimeter breach.",
    "Running diagnostics..." 
];

function getRandomTerminalMessage() {
    const randomIndex = Math.floor(Math.random() * terminalMessages.length);
    return terminalMessages[randomIndex];
}

// Function to schedule the next terminal message
function scheduleNextTerminalMessage() {
    const minDelay = 10000; // 10 seconds
    const maxDelay = 15000; // 15 seconds
    const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

    setTimeout(() => {
        const message = getRandomTerminalMessage();
        UI.showTerminal(message, 6000); // Show for 6 seconds
        scheduleNextTerminalMessage(); // Schedule the next one
    }, randomDelay);
}

// Declare variables for collectibles
let checkDiscCollection;

// Listen for gameStart event
document.addEventListener('gameStart', () => {
    console.log('Main.js received gameStart event!');
    // Start the random terminal messages when the game starts
    scheduleNextTerminalMessage();
});

// Listen for all discs collected event
document.addEventListener('allDiscsCollected', (event) => {
    console.log("Main.js received allDiscsCollected event!", event.detail);
    // The countdown is now triggered by Lost Disc collection instead
});

// Setup environment (fog, lighting, ground)
setupEnvironment(scene);

// Setup collectibles - Removed -> Replaced
// console.log("Setting up collectibles...");
// const { discs, checkDiscCollection, updateDiscCounter } = setupCollectibles(scene, uiContainer); // Old call
// console.log(`Discs array length: ${discs.length}`);
// Setup collectibles
const collectibleData = setupCollectibles(scene); // Call setupCollectibles without uiContainer
checkDiscCollection = collectibleData.checkDiscCollection; // Store the check function

// Setup Lost Disc system
const lostDiscSystem = setupLostDisc(scene);

// Create twigs with machine position check
createTwigs(scene, (position) => {
    return !merchantMachine || !isNearMachine(position, merchantMachine.getPosition());
});

// Create statues with machine position check
const statueCount = 15;
const spawnArea = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
const minStatueDistance = 8;
createStatues(scene, statueCount, spawnArea, minStatueDistance, camera.position.y, (position) => {
    return !merchantMachine || !isNearMachine(position, merchantMachine.getPosition());
});

// Setup audio
const { listener, ambientSound, audioLoader } = setupAudio(camera);

// Camera setup
camera.position.y = 1.7; // Average eye height

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Create monster instance after scene setup
const monster = createMonster(scene);
playerState.setMonsterReference(monster);

// Add G key to controls
keys.g = false;
keys.h = false; // Add H key for Lost Disc debug
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'g') {
        keys.g = true;
        console.log('🎮 G key pressed - Attempting to spawn monster...');
        playerState.spawnMonster();
    }
    if (event.key.toLowerCase() === 'h') {
        keys.h = true;
        console.log('🎮 H key pressed - Debug spawning Lost Disc...');
        document.dispatchEvent(new CustomEvent('spawnLostDisc'));
    }
});
document.addEventListener('keyup', (event) => {
    if (event.key.toLowerCase() === 'g') {
        keys.g = false;
    }
    if (event.key.toLowerCase() === 'h') {
        keys.h = false;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    if (controls.isLocked) {
        // Movement
        velocity.x = 0;
        velocity.z = 0;

        if (keys.w) velocity.z = moveSpeed;
        if (keys.s) velocity.z = -moveSpeed;
        if (keys.a) velocity.x = -moveSpeed;
        if (keys.d) velocity.x = moveSpeed;

        // Apply movement
        controls.moveRight(velocity.x);
        controls.moveForward(velocity.z);

        // Update player position and forward direction for monster system
        const playerObject = controls.getObject();
        playerState.updatePosition(
            playerObject.position.x,
            playerObject.position.y,
            playerObject.position.z
        );
        
        // Get camera's forward direction
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        playerState.updateForwardDirection(forward.x, forward.y, forward.z);

        // Add subtle camera wobble for PS1 effect
        camera.position.y = 1.7 + Math.sin(time * 2) * 0.01;
        
        // Check for disc collection
        if (checkDiscCollection) {
            checkDiscCollection(controls.getObject().position);
        }

        // Check for Lost Disc collection
        if (lostDiscSystem.checkLostDiscCollection) {
            lostDiscSystem.checkLostDiscCollection(controls.getObject().position);
        }

        // Check player proximity to merchant machine
        if (merchantMachine) {
            merchantMachine.checkPlayerProximity(controls.getObject().position);
        }
    }
    
    animateCollectibles(time);
    animateLostDisc(time);

    renderer.render(scene, camera);
}

animate(); 