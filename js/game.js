import { LevelManager } from './levels.js';
import { Assets } from './assets.js';
import { COLORS, formatTime } from './utils.js';
import { Terrain } from './terrain.js';
import { SoundManager } from './sound.js';
import { Lemming } from './lemming.js';

/**
 * Main game class for the Lemmings game
 */

export class Game {
    constructor(canvasId) {
        // Get canvas and context
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resize();
        
        // Game state
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.gameSpeed = 1;
        this.isPaused = false;
        this.debugMode = false;
        
        // Time tracking
        this.lastTime = 0;
        this.timeRemaining = 0;
        
        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.selectedAbility = null;
        
        // Lemming management
        this.lemmings = [];
        this.lemmingCount = 0;
        this.lemmingTotal = 0;
        this.savedCount = 0;
        this.requiredSaveCount = 0;
        this.releaseRate = 1;
        this.releaseTimer = 0;
        this.remainingLemmings = 0;
        
        // Level management
        this.currentLevel = null;
        this.isLevelActive = false;
          // Game components
        this.assets = null;
        this.terrain = null;
        this.levelManager = null;
        this.sound = null;
        
        // Initialize game
        this.init();
    }
      /**
     * Initialize game components
     */
    init() {
        // Create assets manager (procedural graphics)
        this.assets = new Assets(this);
        
        // Create terrain manager
        this.terrain = new Terrain(this, this.width, this.height);
        
        // Create level manager
        this.levelManager = new LevelManager(this);
        
        // Create sound manager
        this.sound = new SoundManager();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show level selection
        this.showLevelSelection();
    }
      /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (!this.isLevelActive || this.isPaused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.handleCanvasClick(x, y);
        });
        
        // Ability buttons
        const abilityButtons = document.querySelectorAll('.ability-btn');
        abilityButtons.forEach(button => {
            button.addEventListener('click', () => {
                const ability = button.id.replace('ability-', '');
                this.selectAbility(ability);
            });
        });
        
        // Game speed controls
        document.getElementById('speed-decrease').addEventListener('click', () => {
            this.gameSpeed = Math.max(0.5, this.gameSpeed - 0.5);
            document.getElementById('current-speed').textContent = this.gameSpeed + 'x';
        });
        
        document.getElementById('speed-increase').addEventListener('click', () => {
            this.gameSpeed = Math.min(3, this.gameSpeed + 0.5);
            document.getElementById('current-speed').textContent = this.gameSpeed + 'x';
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pause-btn').textContent = this.isPaused ? 'Resume' : 'Pause';
        });
        
        // Help button
        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('active');
            this.isPaused = true;
            document.getElementById('pause-btn').textContent = 'Resume';
        });
        
        // Close help button
        document.getElementById('close-help-btn').addEventListener('click', () => {
            document.getElementById('help-modal').classList.remove('active');
        });
        
        // Level complete modal buttons
        document.getElementById('next-level-btn').addEventListener('click', () => {
            document.getElementById('level-complete').classList.remove('active');
            // Start the next level
            const nextLevelId = this.currentLevel.id + 1;
            this.startLevel(nextLevelId);
        });
        
        document.getElementById('retry-level-btn').addEventListener('click', () => {
            document.getElementById('level-complete').classList.remove('active');
            // Retry the same level
            this.startLevel(this.currentLevel.id);
        });
        
        document.getElementById('level-select-btn').addEventListener('click', () => {
            document.getElementById('level-complete').classList.remove('active');
            this.showLevelSelection();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resize();
        });
    }
    
    /**
     * Handle canvas click
     */
    handleCanvasClick(x, y) {
        if (!this.selectedAbility) return;
        
        // Find if a lemming was clicked
        const clickedLemming = this.lemmings.find(lemming => {
            if (!lemming.active) return false;
            
            return x >= lemming.x && 
                   x <= lemming.x + lemming.width &&
                   y >= lemming.y && 
                   y <= lemming.y + lemming.height;
        });
        
        if (clickedLemming) {
            // Apply selected ability
            const abilities = this.currentLevel.abilities;
            
            if (abilities[this.selectedAbility] > 0) {
                if (clickedLemming.grantAbility(this.selectedAbility)) {
                    abilities[this.selectedAbility]--;
                    this.updateAbilityUI();
                }
            }
        }
    }
    
    /**
     * Select an ability
     */    selectAbility(ability) {
        // Deselect all buttons first
        const abilityButtons = document.querySelectorAll('.ability-btn');
        abilityButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Select the new ability if it's different
        if (this.selectedAbility !== ability) {
            this.selectedAbility = ability;
            document.getElementById('ability-' + ability).classList.add('active');
            
            // Play selection sound
            this.sound.playSound('pop', 0.3);
        } else {
            // Clicking the same button deselects it
            this.selectedAbility = null;
        }
    }
    
    /**
     * Show level selection screen
     */
    showLevelSelection() {
        // Reset game state
        this.isLevelActive = false;
        this.lemmings = [];
        
        // Show level selection UI
        const levelSelect = document.getElementById('level-select');
        levelSelect.classList.add('active');
        
        // Clear previous level buttons
        const levelsContainer = document.querySelector('.levels-container');
        levelsContainer.innerHTML = '';
        
        // Add level buttons
        this.levelManager.getAllLevels().forEach(level => {
            const levelButton = document.createElement('button');
            levelButton.classList.add('level-btn');
            levelButton.textContent = `Level ${level.id}: ${level.name}`;
            levelButton.addEventListener('click', () => {
                this.startLevel(level.id);
                levelSelect.classList.remove('active');
            });
            levelsContainer.appendChild(levelButton);
        });
    }
    
    /**
     * Start a specific level
     */
    startLevel(levelId) {
        // Load the level
        if (!this.levelManager.loadLevel(levelId)) return;
        
        // Get level data
        this.currentLevel = this.levelManager.getCurrentLevel();
        
        // Set up level parameters
        this.lemmingTotal = this.currentLevel.lemmingCount;
        this.remainingLemmings = this.lemmingTotal;
        this.releaseRate = this.currentLevel.releaseRate;
        this.timeRemaining = this.currentLevel.timeLimit;
        this.requiredSaveCount = this.currentLevel.requiredSaveCount;
        
        // Reset counters
        this.lemmingCount = 0;
        this.savedCount = 0;
        this.releaseTimer = 0;
        
        // Clear lemmings array
        this.lemmings = [];
        
        // Update UI
        this.updateCountsUI();
        this.updateAbilityUI();
        
        // Start level
        this.isLevelActive = true;
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = 'Pause';
        
        // Start game loop if not already running
        if (!this.lastTime) {
            this.lastTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
    
    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update and render
        this.update(deltaTime);
        this.render();
        
        // Continue loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        if (!this.isLevelActive || this.isPaused) return;
        
        // Update time remaining
        this.timeRemaining -= (deltaTime / 1000) * this.gameSpeed;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.endLevel(false);
        }
        
        // Update lemming release
        this.updateLemmingRelease(deltaTime);
        
        // Update all lemmings
        this.lemmings.forEach(lemming => {
            lemming.update(deltaTime);
        });
        
        // Handle blocker collisions
        this.handleBlockerCollisions();
        
        // Update UI
        this.updateCountsUI();
        
        // Check win condition
        if (this.savedCount >= this.requiredSaveCount) {
            this.endLevel(true);
        }
        
        // Check if all lemmings are gone and none can be saved
        const activeLemmings = this.lemmings.filter(l => l.active).length;
        if (activeLemmings === 0 && this.remainingLemmings === 0) {
            // No more lemmings to release and none active
            if (this.savedCount < this.requiredSaveCount) {
                this.endLevel(false);
            }
        }
    }
    
    /**
     * Update lemming release
     */
    updateLemmingRelease(deltaTime) {
        if (this.remainingLemmings <= 0) return;
        
        // Increment release timer
        this.releaseTimer += (deltaTime / 1000) * this.gameSpeed;
        
        // Check if it's time to release a lemming
        const releaseInterval = 1 / this.releaseRate;
        if (this.releaseTimer >= releaseInterval) {
            this.releaseTimer = 0;
            this.releaseLemming();
        }
    }
    
    /**
     * Release a new lemming
     */
    releaseLemming() {
        if (!this.terrain.entry || this.remainingLemmings <= 0) return;
        
        // Create new lemming at entry point
        const lemming = new Lemming(
            this,
            this.terrain.entry.x + 12,  // Center in entry
            this.terrain.entry.y + 20   // Bottom of entry
        );
        
        this.lemmings.push(lemming);
        this.lemmingCount++;
        this.remainingLemmings--;
    }
    
    /**
     * Handle blocker collisions with other lemmings
     */
    handleBlockerCollisions() {
        // Find all active blockers
        const blockers = this.lemmings.filter(l => 
            l.active && l.state === 'blocking'
        );
        
        if (blockers.length === 0) return;
        
        // Check collisions with other lemmings
        this.lemmings.forEach(lemming => {
            if (!lemming.active || lemming.state === 'blocking') return;
            
            // Check collision with each blocker
            for (const blocker of blockers) {
                if (lemming.checkCollisionWithLemming(blocker)) {
                    // Turn around
                    lemming.direction *= -1;
                    break;
                }
            }
        });
    }
    
    /**
     * Called when a lemming is saved
     */
    lemmingSaved() {
        this.savedCount++;
    }
      /**
     * End the current level
     */
    endLevel(isWin) {
        this.isLevelActive = false;
        
        // Update level result modal
        document.getElementById('level-result-title').textContent = 
            isWin ? 'Level Complete!' : 'Level Failed';
        
        document.getElementById('saved-lemmings').textContent = this.savedCount;
        document.getElementById('total-lemmings').textContent = this.lemmingTotal;
        
        const resultMessage = isWin
            ? `You saved ${this.savedCount} out of ${this.lemmingTotal} lemmings.`
            : `You saved ${this.savedCount} out of ${this.lemmingTotal} lemmings. Required: ${this.requiredSaveCount}`;
        
        document.getElementById('level-result-message').textContent = resultMessage;
        
        // Show/hide next level button based on whether there is a next level
        const currentLevelId = this.currentLevel.id;
        const hasNextLevel = this.levelManager.levels.some(l => l.id === currentLevelId + 1);
        
        document.getElementById('next-level-btn').style.display = 
            (isWin && hasNextLevel) ? 'block' : 'none';
        
        // Show the modal
        document.getElementById('level-complete').classList.add('active');
    }
    
    /**
     * Update UI counters
     */
    updateCountsUI() {
        document.getElementById('lemming-count').textContent = this.lemmingCount;
        document.getElementById('lemming-total').textContent = this.lemmingTotal;
        document.getElementById('saved-count').textContent = this.savedCount;
        document.getElementById('time-remaining').textContent = formatTime(Math.max(0, this.timeRemaining));
    }
    
    /**
     * Update ability UI
     */
    updateAbilityUI() {
        if (!this.currentLevel) return;
        
        const abilities = this.currentLevel.abilities;
        
        // Update each ability button
        Object.keys(abilities).forEach(ability => {
            const button = document.getElementById('ability-' + ability);
            if (button) {
                // Update count indicator
                button.textContent = ability.charAt(0).toUpperCase() + ability.slice(1) + ` (${abilities[ability]})`;
                
                // Disable if no abilities left
                if (abilities[ability] <= 0) {
                    button.classList.add('disabled');
                    if (this.selectedAbility === ability) {
                        this.selectedAbility = null;
                    }
                    button.classList.remove('active');
                } else {
                    button.classList.remove('disabled');
                }
            }
        });
    }
    /**
     * Render game
     */    render() {
        // Clear canvas with solid color (fallback)
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
          // Normal terrain rendering
        this.terrain.render(this.ctx);
        
        // If in debug mode, show collision map overlay
        if (this.debugMode) {
            this.terrain.debugRender(this.ctx);
            
            // Draw text to show how to use builder
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('Press D to toggle debug view', 10, 100);
            this.ctx.fillText('Build a bridge across the gap!', 10, 120);
            this.ctx.fillText('1. Select Builder ability (5)', 10, 150);
            this.ctx.fillText('2. Click on a lemming at the edge', 10, 170);
        }
        
        // Render lemmings
        this.lemmings.forEach(lemming => {
            lemming.render(this.ctx);
            
            // Debug: show lemming collision boxes
            if (this.debugMode) {
                this.ctx.strokeStyle = '#00FF00';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(lemming.x, lemming.y, lemming.width, lemming.height);
            }
        });
        
        // Render cursor for selected ability
        if (this.selectedAbility && this.isLevelActive && !this.isPaused) {
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 12, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(this.selectedAbility, this.mouseX + 15, this.mouseY - 5);
        }
        
        // Debug information
        if (this.debugMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(10, 10, 200, 60);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Active lemmings: ${this.lemmings.filter(l => l.active).length}`, 15, 25);
            this.ctx.fillText(`FPS: ${Math.round(1000 / (performance.now() - this.lastTime))}`, 15, 40);
            this.ctx.fillText(`Mouse: ${Math.round(this.mouseX)}, ${Math.round(this.mouseY)}`, 15, 55);
        }
    }
    
    /**
     * Resize canvas
     */
    resize() {
        // Get container size
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        
        // Set canvas size (maintaining 16:9 aspect ratio)
        this.canvas.width = width;
        this.canvas.height = Math.floor(width * (9/16));
        
        // Update game dimensions
        if (this.terrain) {
            // Re-create terrain with new size
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.terrain = new Terrain(this, this.width, this.height);
            
            // Rebuild current level if active
            if (this.currentLevel) {
                this.currentLevel.build(this);
            }
        }
    }
}

// Export is already handled with the class declaration
