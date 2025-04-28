import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

export function setupEnvironment(scene) {
    // Fog setup - slightly reduced density for better visibility
    scene.fog = new THREE.FogExp2(0x8B8B6E, 0.065); // Reduced from 0.075
    
    // Scene background color matching fog
    scene.background = new THREE.Color(0x8B8B6E);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x7A6F5D, 5); // Increased from 0.6
    scene.add(ambientLight);
    
    // Add a directional light for dusk sun - brighter and warmer
    const directionalLight = new THREE.DirectionalLight(0xFFA07A, 1); // Increased from 0.3
    directionalLight.position.set(-1, 0.2, -0.2);
    scene.add(directionalLight);
    
    // Ground
    // Original size: 100x100 - which means edges at x: ±50, z: ±50
    const groundGeometry = new THREE.PlaneGeometry(150, 150); // Increased by 50% from 100x100
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x5C5C4D,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    return {
        ground,
        ambientLight,
        directionalLight,
        groundMaterial
    };
}

// Function to change scene colors for Lost Disc appearance
export function changeToLostDiscEnvironment(scene, elements) {
    const PURPLE_FOG_COLOR = 0x4A4A5A; // Purple-tinted fog color from screenshot
    
    // Smoothly transition fog and background
    scene.fog.color.setHex(PURPLE_FOG_COLOR);
    scene.background.setHex(PURPLE_FOG_COLOR);
    
    // Adjust lighting for darker atmosphere
    elements.ambientLight.color.setHex(0x4A4A5A);
    elements.ambientLight.intensity = 10; // Reduce ambient light
    
    elements.directionalLight.color.setHex(0x6A6A7A);
    elements.directionalLight.intensity = 2;
    
    // Darken ground
    elements.groundMaterial.color.setHex(0x2A2A3A);
} 