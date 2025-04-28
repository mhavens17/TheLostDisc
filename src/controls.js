import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export function setupControls(camera, instructions) {
    const controls = new PointerLockControls(camera, document.body);
    let gameStarted = false; // Flag to track if game has started
    
    // Movement variables
    const moveSpeed = 0.15;
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };
    const velocity = new THREE.Vector3();
    
    // Click to play
    document.addEventListener('click', () => {
        controls.lock();
    });
    
    // Lock/unlock controls
    controls.addEventListener('lock', () => {
        instructions.style.display = 'none';
        
        // Dispatch gameStart event only once
        if (!gameStarted) {
            gameStarted = true;
            const gameStartEvent = new CustomEvent('gameStart');
            document.dispatchEvent(gameStartEvent);
            console.log('Game started! Player has clicked to play.');
        }
    });
    
    controls.addEventListener('unlock', () => {
        instructions.style.display = 'block';
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW':
                keys.w = true;
                break;
            case 'KeyA':
                keys.a = true;
                break;
            case 'KeyS':
                keys.s = true;
                break;
            case 'KeyD':
                keys.d = true;
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW':
                keys.w = false;
                break;
            case 'KeyA':
                keys.a = false;
                break;
            case 'KeyS':
                keys.s = false;
                break;
            case 'KeyD':
                keys.d = false;
                break;
        }
    });
    
    return { controls, moveSpeed, keys, velocity };
} 