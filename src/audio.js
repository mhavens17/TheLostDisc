import * as THREE from 'three';

export function setupAudio(camera) {
    // Audio setup
    const listener = new THREE.AudioListener();
    camera.add(listener);
    
    const ambientSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    
    // Load ambient sound (you'll need to add your own sound file)
    // audioLoader.load('assets/sounds/ambient.mp3', (buffer) => {
    //     ambientSound.setBuffer(buffer);
    //     ambientSound.setLoop(true);
    //     ambientSound.setVolume(0.5);
    //     ambientSound.play();
    // });
    
    return {
        listener,
        ambientSound,
        audioLoader
    };
} 