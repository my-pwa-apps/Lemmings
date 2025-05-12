/**
 * Level definitions for the Lemmings game
 */

class Level {
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
class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = [];
        this.currentLevel = null;
        
        this.createLevels();
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
            },
            buildFunction: (game) => {
                const width = game.width;
                const height = game.height;
                
                // Base ground
                game.terrain.addRect(0, height - 40, width, 40, 'dirt');
                
                // Gap in the middle
                game.terrain.digCircle(width / 2, height - 30, 50);
                
                // Entry point
                game.terrain.setEntry(50, 100);
                
                // Exit point
                game.terrain.setExit(width - 100, height - 64);
            }
        }));
    }
}
