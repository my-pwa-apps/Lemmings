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
        
        // Background music properties
        this.backgroundMusic = null;
        this.musicGainNode = null;
        this.currentMusicLoop = null;
        
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
        
        // Also mute/unmute background music if it's playing
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.isMuted ? 0 : 0.3;
        }
        
        return this.isMuted;
    }
    
    /**
     * Create procedural background music for gameplay
     * @param {string} type - Type of music: 'gameplay', 'success', or 'failure'
     */
    createBackgroundMusic(type = 'gameplay') {
        if (!this.audioContext) return;
        
        // Stop any currently playing music
        this.stopBackgroundMusic();
        
        // Create gain node for volume control
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.gain.value = this.isMuted ? 0 : 0.3; // Lower volume for background music
        this.musicGainNode.connect(this.audioContext.destination);
        
        let noteDuration, pattern, baseFreq, noteSpacing, musicLength;
        
        switch(type) {
            case 'success':
                // Cheerful, upbeat music for level completion
                noteDuration = 0.15;
                noteSpacing = 0.17;
                baseFreq = 440; // A4
                pattern = [0, 4, 7, 12, 7, 4, 7, 12]; // Major scale pattern
                musicLength = pattern.length * noteSpacing;
                break;
                
            case 'failure':
                // Sad, minor music for level failure
                noteDuration = 0.3;
                noteSpacing = 0.35;
                baseFreq = 392; // G4
                pattern = [0, 3, 7, 10, 7, 3]; // Minor scale pattern
                musicLength = pattern.length * noteSpacing;
                break;
                
            case 'gameplay':
            default:
                // Default gameplay background music - quirky, catchy loop
                noteDuration = 0.2;
                noteSpacing = 0.22;
                baseFreq = 330; // E4
                pattern = [0, 4, 7, 4, 0, 5, 9, 5, 2, 7, 11, 7, 0, 4, 7, 12];
                musicLength = pattern.length * noteSpacing;
                break;
        }
        
        // Create a buffer for the melody pattern
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * musicLength,
            this.audioContext.sampleRate
        );
        
        const data = buffer.getChannelData(0);
        
        // Generate the music pattern
        for (let i = 0; i < pattern.length; i++) {
            const note = pattern[i];
            const freq = this.getNoteFrequency(baseFreq, note);
            const startSample = Math.floor(i * noteSpacing * this.audioContext.sampleRate);
            const endSample = Math.floor((i * noteSpacing + noteDuration) * this.audioContext.sampleRate);
            
            // Generate a simple tone with envelope
            for (let j = startSample; j < endSample && j < buffer.length; j++) {
                const t = (j - startSample) / (endSample - startSample); // Time position within note (0-1)
                const envelope = Math.sin(t * Math.PI); // Simple envelope: fade in, fade out
                data[j] += Math.sin(freq * 2 * Math.PI * (j / this.audioContext.sampleRate)) * envelope * 0.3;
            }
        }
        
        this.backgroundMusic = buffer;
    }
    
    /**
     * Calculate frequency for a note
     * @param {number} baseFreq - Base frequency
     * @param {number} semitones - Number of semitones from base frequency
     * @returns {number} - Resulting frequency
     */
    getNoteFrequency(baseFreq, semitones) {
        return baseFreq * Math.pow(2, semitones / 12);
    }
    
    /**
     * Play background music in a loop
     * @param {string} type - Type of music: 'gameplay', 'success', or 'failure' 
     * @param {boolean} loop - Whether to loop the music
     */
    playBackgroundMusic(type = 'gameplay', loop = true) {
        if (!this.audioContext) return;
        
        // Create the music if we don't have it or need a different type
        this.createBackgroundMusic(type);
        
        try {
            // Need to resume audio context if it was suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const source = this.audioContext.createBufferSource();
            source.buffer = this.backgroundMusic;
            source.loop = loop;
            source.connect(this.musicGainNode);
            source.start();
            
            // Store the current audio source for later stopping
            this.currentMusicLoop = source;
        } catch(e) {
            console.error("Error playing background music:", e);
        }
    }
    
    /**
     * Stop background music if it's playing
     */
    stopBackgroundMusic() {
        if (this.currentMusicLoop) {
            try {
                this.currentMusicLoop.stop();
            } catch (e) {
                console.log("Couldn't stop music (might already be stopped):", e);
            }
            this.currentMusicLoop = null;
        }
    }
    
    /**
     * Set the volume of the background music
     * @param {number} volume - Volume from 0 to 1
     */
    setMusicVolume(volume) {
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = volume;
        }
    }
}
