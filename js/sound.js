/**
 * Sound manager for the Lemmings game
 * Uses Web Audio API to generate sound effects programmatically
 */

export class SoundManager {
    constructor() {
        // Initialize audio context
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = false;
        
        // Try to initialize audio (needs to be done after user interaction)
        this.init();
    }
    
    /**
     * Initialize audio context
     */
    init() {
        try {
            // Modern browsers
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Generate sounds
            this.generateSounds();
            
            console.log("Sound system initialized");
        } catch(e) {
            console.warn("Web Audio API not supported");
            this.audioContext = null;
        }
    }
    
    /**
     * Generate all game sound effects
     */
    generateSounds() {
        if (!this.audioContext) return;
        
        // Pop sound (for ability selection)
        this.createPopSound();
        
        // Splat sound (for falling lemmings)
        this.createSplatSound();
        
        // Build sound
        this.createBuildSound();
        
        // Dig sound
        this.createDigSound();
        
        // Explosion sound
        this.createExplosionSound();
        
        // Success sound
        this.createSuccessSound();
        
        // Fail sound
        this.createFailSound();
        
        // Exit sound (lemming saved)
        this.createExitSound();
    }
    
    /**
     * Create a pop sound effect
     */
    createPopSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.1,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const freq = 1000 - 900 * t;
            data[i] = Math.sin(freq * t * Math.PI * 10) * (1 - t);
        }
        
        this.sounds.pop = buffer;
    }
    
    /**
     * Create a splat sound effect
     */
    createSplatSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.3,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const noise = Math.random() * 2 - 1;
            data[i] = noise * Math.exp(-t * 10) * 0.5;
        }
        
        this.sounds.splat = buffer;
    }
    
    /**
     * Create a building sound effect
     */
    createBuildSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.15,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const freq = 300 + Math.sin(t * 10) * 50;
            data[i] = Math.sin(freq * t * Math.PI * 2) * (1 - t) * 0.5;
        }
        
        this.sounds.build = buffer;
    }
    
    /**
     * Create a digging sound effect
     */
    createDigSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.2,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const noise = (Math.random() * 2 - 1) * 0.5;
            const freq = 100 + t * 200;
            const tone = Math.sin(freq * t * Math.PI * 10) * 0.5;
            data[i] = (noise + tone) * (1 - t);
        }
        
        this.sounds.dig = buffer;
    }
    
    /**
     * Create an explosion sound effect
     */
    createExplosionSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.5,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const noise = Math.random() * 2 - 1;
            data[i] = noise * Math.exp(-t * 5);
        }
        
        this.sounds.explosion = buffer;
    }
    
    /**
     * Create a success sound effect
     */
    createSuccessSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.6,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            let val = 0;
            
            // Chord
            val += Math.sin(440 * t * Math.PI * 2) * 0.2; // A
            val += Math.sin(550 * t * Math.PI * 2) * 0.2; // C#
            val += Math.sin(660 * t * Math.PI * 2) * 0.2; // E
            
            // Apply envelope
            val *= Math.exp(-t * 3);
            
            data[i] = val;
        }
        
        this.sounds.success = buffer;
    }
    
    /**
     * Create a fail sound effect
     */
    createFailSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.6,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            let val = 0;
            
            // Sad chord
            val += Math.sin(440 * t * Math.PI * 2) * 0.2; // A
            val += Math.sin(523 * t * Math.PI * 2) * 0.2; // C
            val += Math.sin(622 * t * Math.PI * 2) * 0.2; // D#
            
            // Apply envelope
            val *= Math.exp(-t * 3);
            
            data[i] = val;
        }
        
        this.sounds.fail = buffer;
    }
    
    /**
     * Create an exit/save sound effect
     */
    createExitSound() {
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.3,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            const freq = 300 + 500 * t;
            data[i] = Math.sin(freq * t * Math.PI * 4) * (1 - t) * 0.5;
        }
        
        this.sounds.exit = buffer;
    }
    
    /**
     * Play a sound by name
     */
    playSound(soundName, volume = 0.5) {
        if (this.isMuted || !this.audioContext || !this.sounds[soundName]) return;
        
        try {
            // Need to resume audio context if it was suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName];
            
            // Create a gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;
            
            // Connect the source to the gain node and the gain node to the destination
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Play the sound
            source.start();
        } catch(e) {
            console.error("Error playing sound:", e);
        }
    }
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
}
