import * as THREE from 'three';
import { setupControls } from './controls.js';
import { setupEnvironment } from './environment.js';
// import { setupCollectibles } from './collectibles.js'; // Removed
import { setupCollectibles, animateCollectibles } from './collectible.js'; // Import new functions
import { createTwigs } from './twigs.js';
import { createStatues } from './statue.js';
import { setupAudio } from './audio.js';
import { setupUI } from './ui.js';

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
const { uiContainer, instructions } = setupUI();

// Set up controls with instructions
const { controls, moveSpeed, keys, velocity } = setupControls(camera, instructions);
scene.add(controls.getObject());

// Declare variables for collectibles
let checkDiscCollection;

// Listen for gameStart event
document.addEventListener('gameStart', () => {
    console.log('Main.js received gameStart event!');
    // You can add game initialization logic here
    // For example, start background music, initialize game state, etc.
});

// Setup environment (fog, lighting, ground)
setupEnvironment(scene);

// Setup collectibles - Removed -> Replaced
// console.log("Setting up collectibles...");
// const { discs, checkDiscCollection, updateDiscCounter } = setupCollectibles(scene, uiContainer);
// console.log(`Discs array length: ${discs.length}`);
// Setup collectibles
const collectibleData = setupCollectibles(scene, uiContainer);
checkDiscCollection = collectibleData.checkDiscCollection; // Store the check function

// Create twigs
createTwigs(scene);

// Create statues
const statueCount = 15; // How many statues
const spawnArea = { minX: -50, maxX: 50, minZ: -50, maxZ: 50 }; // Area to spawn in
const minStatueDistance = 8; // Minimum distance between statues and from player start
createStatues(scene, statueCount, spawnArea, minStatueDistance, camera.position.y);

// Setup audio
const { listener, ambientSound, audioLoader } = setupAudio(camera);

// Camera setup
camera.position.y = 1.7; // Average eye height

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001; // Get time once per frame

    if (controls.isLocked) {
        // Movement
        velocity.x = 0;
        velocity.z = 0;

        if (keys.w) velocity.z = moveSpeed; // W moves forward
        if (keys.s) velocity.z = -moveSpeed; // S moves backward
        if (keys.a) velocity.x = -moveSpeed;
        if (keys.d) velocity.x = moveSpeed;

        // Apply movement
        controls.moveRight(velocity.x);
        controls.moveForward(velocity.z);

        // Add subtle camera wobble for PS1 effect
        camera.position.y = 1.7 + Math.sin(time * 2) * 0.01;
        
        // Check for disc collection - Removed -> Replaced
        // checkDiscCollection(camera.position);
        if (checkDiscCollection) {
             checkDiscCollection(controls.getObject().position); // Use player's position
        }
    }
    
    // Animate discs - Removed -> Replaced
    // const time = Date.now() * 0.001; // Moved time calculation up
    // if (discs && discs.length > 0) { // Check if discs exists before accessing length
    //     console.log(`Animating ${discs.length} discs`);
    // }
    // for (const disc of discs || []) { // Check if discs exists before iterating
    //     // Rotate around Y axis instead of Z for better visibility
    //     disc.rotation.y = time * 2; // Continuous rotation around Y-axis
    //     disc.position.y = 0.5 + Math.sin(time * 3) * 0.05; // Slight bobbing motion
    // }
    animateCollectibles(time); // Animate discs every frame

    renderer.render(scene, camera);
}

animate(); 