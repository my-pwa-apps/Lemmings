import { Game } from './game.js';

/**
 * Main entry point for the Lemmings game
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    const game = new Game('game-canvas');
      
    // Log initialization
    console.log('Lemmings game initialized');
    
    // Initialize help and modal buttons
    document.getElementById('help-btn').addEventListener('click', () => {
        document.getElementById('help-modal').classList.add('active');
        game.isPaused = true;
        document.getElementById('pause-btn').textContent = 'Resume';
    });
    
    document.getElementById('close-help-btn').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
        // Don't auto-unpause when closing help
    });
    
    // Sound button functionality
    document.getElementById('sound-btn').addEventListener('click', () => {
        const soundButton = document.getElementById('sound-btn');
        const isMuted = game.sound.toggleMute();
        
        // Update button text to show muted/unmuted state
        soundButton.textContent = isMuted ? '🔇' : '🔊';
        soundButton.classList.toggle('muted', isMuted);
        
        // Play a sound to confirm if unmuting
        if (!isMuted) {
            game.sound.playSound('pop', 0.3);
        }
    });
    
    // Add keyboard shortcuts for better gameplay
    document.addEventListener('keydown', (e) => {
        // Toggle debug mode with 'D' key
        if (e.key === 'd' || e.key === 'D') {
            // Debug functionality - toggle terrain collision visibility
            game.debugMode = !game.debugMode;
        }
        
        // Game controls
        if (e.key === 'p' || e.key === 'P') {
            // Toggle pause
            game.isPaused = !game.isPaused;
            document.getElementById('pause-btn').textContent = game.isPaused ? 'Resume' : 'Pause';
        }
        
        // Speed controls
        if (e.key === '+' || e.key === '=') {
            // Increase speed
            game.gameSpeed = Math.min(3, game.gameSpeed + 0.5);
            document.getElementById('current-speed').textContent = game.gameSpeed + 'x';
        }
        if (e.key === '-' || e.key === '_') {
            // Decrease speed
            game.gameSpeed = Math.max(0.5, game.gameSpeed - 0.5);
            document.getElementById('current-speed').textContent = game.gameSpeed + 'x';
        }
        
        // Toggle sound with 'M' key
        if (e.key === 'm' || e.key === 'M') {
            const soundButton = document.getElementById('sound-btn');
            const isMuted = game.sound.toggleMute();
            soundButton.textContent = isMuted ? '🔇' : '🔊';
            soundButton.classList.toggle('muted', isMuted);
        }
        
        // Number keys 1-8 for selecting abilities
        if (e.key >= '1' && e.key <= '8') {
            const abilityIndex = parseInt(e.key) - 1;
            const abilities = ['climber', 'floater', 'bomber', 'blocker', 'builder', 'basher', 'miner', 'digger'];
            if (abilityIndex >= 0 && abilityIndex < abilities.length) {
                game.selectAbility(abilities[abilityIndex]);
            }
        }
        
        // Escape key to show level selection
        if (e.key === 'Escape') {
            if (game.isLevelActive) {
                if (confirm('Return to level selection?')) {
                    game.showLevelSelection();
                }
            }
        }
    });
});
