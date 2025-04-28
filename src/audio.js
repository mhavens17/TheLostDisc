import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

/**
 * Enhanced sound management system for the game
 * - Creates new Audio instances for each play
 * - Supports volume control and random pitch variation
 * - Tracks active sounds for proper cleanup
 * - Handles automatically reducing volume for specific sounds
 */
class SoundManager {
    constructor() {
        this.sounds = {}; // Cache for preloaded sounds
        this.activeSounds = []; // Track all currently playing sounds
        this.reducedVolumeSounds = ['collect', 'tick', 'trade']; // Sounds that need 50% volume reduction
        this.isGameOver = false;
        
        // Listen for game over event to stop all sounds
        document.addEventListener('gameOver', () => {
            this.stopAllSounds();
            this.isGameOver = true;
        });
    }

    /**
     * Preload a sound into the cache
     * @param {string} name - Sound identifier
     * @param {string} src - Path to sound file
     * @returns {Audio} - The created Audio object
     */
    loadSound(name, src) {
        const audio = new Audio(src);
        this.sounds[name] = src; // Store the path, not the Audio object
        return audio; // Return the Audio object for immediate use if needed
    }

    /**
     * Play a sound with the given options
     * @param {string} src - Sound source path or name (if preloaded)
     * @param {Object} options - Sound playback options
     * @param {number} options.volume - Volume level (0.0 to 1.0)
     * @param {boolean} options.randomPitch - Whether to apply random pitch
     * @returns {Audio} - The playing Audio object
     */
    playSound(src, options = {}) {
        // Don't play new sounds if in game over state
        if (this.isGameOver) return null;
        
        // Resolve the source path (either direct path or from preloaded names)
        const sourcePath = this.sounds[src] || src;
        
        // Create a new Audio instance for each play
        const sound = new Audio(sourcePath);
        
        // Extract options with defaults
        const volume = options.volume !== undefined ? options.volume : 1.0;
        const randomPitch = options.randomPitch || false;
        
        // Calculate the final volume (apply 50% reduction for specific sounds)
        let finalVolume = volume;
        // Check if this sound should have reduced volume
        const soundName = Object.keys(this.sounds).find(name => this.sounds[name] === sourcePath) || src;
        if (this.reducedVolumeSounds.includes(soundName)) {
            finalVolume = volume * 0.5;
        }
        
        // Apply volume
        sound.volume = finalVolume;
        
        // Apply random pitch if requested
        if (randomPitch) {
            // Random value between 0.9 and 1.1 (±10%)
            sound.playbackRate = 0.9 + Math.random() * 0.2;
        }
        
        // Start playback
        const playPromise = sound.play().catch(error => {
            console.error(`Error playing sound: ${src}`, error);
            // Remove from active sounds if it failed to play
            const index = this.activeSounds.indexOf(sound);
            if (index !== -1) this.activeSounds.splice(index, 1);
        });
        
        // Add to active sounds list
        this.activeSounds.push(sound);
        
        // Set up automatic cleanup when sound finishes
        sound.addEventListener('ended', () => {
            const index = this.activeSounds.indexOf(sound);
            if (index !== -1) this.activeSounds.splice(index, 1);
        });
        
        return sound;
    }
    
    /**
     * Stop all currently playing sounds
     */
    stopAllSounds() {
        console.log(`Stopping all ${this.activeSounds.length} active sounds`);
        // Create a copy of the array since we'll be modifying it during iteration
        const sounds = [...this.activeSounds];
        
        for (const sound of sounds) {
            sound.pause();
            sound.currentTime = 0;
        }
        
        // Clear the active sounds array
        this.activeSounds = [];
    }
    
    /**
     * Stop a specific type of sound by matching its source URL
     * @param {string} sourcePattern - String pattern to match in sound src
     */
    stopSoundsBySource(sourcePattern) {
        const soundsToStop = this.activeSounds.filter(sound => 
            sound.src.includes(sourcePattern));
            
        if (soundsToStop.length > 0) {
            console.log(`Stopping ${soundsToStop.length} sounds matching: ${sourcePattern}`);
            
            for (const sound of soundsToStop) {
                sound.pause();
                sound.currentTime = 0;
                const index = this.activeSounds.indexOf(sound);
                if (index !== -1) this.activeSounds.splice(index, 1);
            }
        }
    }
    
    /**
     * Play a sound by name with optional random pitch
     * @param {string} name - Preloaded sound name
     * @param {Object} options - Optional playback settings
     * @returns {Audio} - The playing Audio object
     */
    play(name, options = {}) {
        if (!this.sounds[name]) {
            console.error(`Sound "${name}" not found. Make sure to load it first.`);
            return null;
        }
        
        // Default random pitch for specific sounds
        if (options.randomPitch === undefined) {
            // Apply random pitch to tick, collect, and trade by default
            options.randomPitch = ['tick', 'collect', 'trade'].includes(name);
        }
        
        return this.playSound(name, options);
    }
}

// Create and export a singleton instance
export const soundManager = new SoundManager();

/**
 * Set up audio for the game scene
 * @param {THREE.Camera} camera - The game camera for spatial audio
 * @returns {Object} - Audio objects for the scene
 */
export function setupAudio(camera) {
    // THREE.js audio setup for spatial audio
    const listener = new THREE.AudioListener();
    camera.add(listener);
    
    const ambientSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    
    // Initialize common sound effects
    soundManager.loadSound('tick', 'assets/sounds/tick.mp3');
    soundManager.loadSound('collect', 'assets/sounds/collect.mp3');
    soundManager.loadSound('trade', 'assets/sounds/trade.mp3');
    soundManager.loadSound('scare', 'assets/sounds/scare.mp3');
    soundManager.loadSound('shepardsFear', 'assets/sounds/shepards fear.mp3');
    
    console.log('Audio system initialized');
    
    return {
        listener,
        ambientSound,
        audioLoader
    };
} 