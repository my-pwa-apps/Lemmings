/**
 * Level definitions for the Lemmings game
 */

export class Level {
    constructor(id, name, properties) {
        this.id = id;
        this.name = name;
        
        // Default properties
        this.lemmingCount = 10;
        this.releaseRate = 1; // Lemmings per second
        this.timeLimit = 300; // Seconds
        this.requiredSaveCount = 5;
        
        // Ability counts
        this.abilities = {
            climber: 0,
            floater: 0,
            bomber: 0,
            blocker: 0,
            builder: 0,
            basher: 0,
            miner: 0,
            digger: 0
        };
        
        // Override with provided properties
        if (properties) {
            Object.assign(this, properties);
        }
    }
    
    /**
     * Build this level in the game
     */
    build(game) {
        // Reset terrain first
        game.terrain.clear();
        
        // Call the level-specific build function
        if (this.buildFunction) {
            this.buildFunction(game);
        } else {
            this.buildDefault(game);
        }
    }
    
    /**
     * Default level builder (simple flat terrain)
     */
    buildDefault(game) {
        const width = game.width;
        const height = game.height;
        
        // Add ground
        game.terrain.addRect(0, height - 40, width, 40, 'dirt');
        
        // Add entry and exit
        game.terrain.setEntry(50, 50);
        game.terrain.setExit(width - 100, height - 64);
    }
}

/**
 * Level manager class
 */
export class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = [];
        this.currentLevel = null;
        
        this.createLevels();
    }
      /**
     * Get all levels
     */
    getAllLevels() {
        return this.levels;
    }
    
    /**
     * Get current level
     */
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    /**
     * Load a specific level by ID
     */
    loadLevel(id) {
        const level = this.levels.find(l => l.id === id);
        if (!level) return false;
        
        this.currentLevel = level;
        level.build(this.game);
        return true;
    }
    
    /**
     * Create all game levels
     */
    createLevels() {
        // Level 1: Bridge the Gap
        this.levels.push(new Level(1, "Bridge the Gap", {
            lemmingCount: 10,
            releaseRate: 0.8, // Slower release rate to give more time
            timeLimit: 300,
            requiredSaveCount: 5,
            abilities: {
                climber: 0,
                floater: 2, // Add some floaters as safety
                bomber: 1, // Add bomber for emergencies
                blocker: 1, // Add blocker to control flow
                builder: 5, // More builders for bridging attempts
                basher: 0,
                miner: 0,
                digger: 3
            },            buildFunction: (game) => {
                const width = game.width;
                const height = game.height;
                  
                // Base ground - making it more visible
                game.terrain.addRect(0, height - 40, width, 40, 'dirt');
                
                // Create a clearly defined gap in the middle - larger and more obvious
                // Use rectangular gap instead of circular
                const gapWidth = 100;
                const gapX = width/2 - gapWidth/2;
                game.terrain.ctx.save();
                game.terrain.ctx.globalCompositeOperation = 'destination-out';
                game.terrain.ctx.fillRect(gapX, height - 40, gapWidth, 40);
                game.terrain.ctx.restore();
                
                // Add more prominent visual indicators around the gap
                game.terrain.addRect(gapX - 10, height - 45, 10, 10, 'rock'); // Left warning marker
                game.terrain.addRect(gapX + gapWidth, height - 45, 10, 10, 'rock'); // Right warning marker
                
                // Add arrow indicators pointing to the gap
                for (let i = 0; i < 3; i++) {
                    // Left side arrows
                    game.terrain.addRect(gapX - 30 - (i * 15), height - 60, 10, 5, 'rock');
                    // Right side arrows
                    game.terrain.addRect(gapX + gapWidth + 20 + (i * 15), height - 60, 10, 5, 'rock');
                }
                
                // Entry point - moved to ensure lemmings spawn safely on solid ground
                game.terrain.setEntry(width/4, 100); // Move further left from the gap
                
                // Exit point - positioned on the right side
                game.terrain.setExit(width - 100, height - 64);
            }
        }));    }
}
