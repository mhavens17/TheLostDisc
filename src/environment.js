import * as THREE from 'three';

export function setupEnvironment(scene) {
    // Fog setup
    scene.fog = new THREE.FogExp2(0x8B8B6E, 0.075); // Olive-tinted fog with higher density
    
    // Scene background color matching fog
    scene.background = new THREE.Color(0x8B8B6E);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x7A6F5D, 0.6); // Warm, dim dusk lighting
    scene.add(ambientLight);
    
    // Add a directional light for dusk sun
    const directionalLight = new THREE.DirectionalLight(0xFFA07A, 0.3); // Soft orange light
    directionalLight.position.set(-1, 0.2, -0.2); // Position for dusk angle
    scene.add(directionalLight);
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x5C5C4D, // Darker olive color for ground
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    return {
        ground
    };
} 