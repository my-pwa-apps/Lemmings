/**
 * Level definitions for the Lemmings game
 * Each level specifies terrain layout, abilities, and win conditions
 */

export class Level {
    constructor(id, name, props) {
        this.id = id;
        this.name = name;

        // Defaults
        this.lemmingCount = 10;
        this.releaseRate = 1;
        this.timeLimit = 300;
        this.requiredSaveCount = 5;
        this.abilities = {
            climber: 0, floater: 0, bomber: 0, blocker: 0,
            builder: 0, basher: 0, miner: 0, digger: 0
        };
        this.buildFunction = null;

        if (props) Object.assign(this, props);
    }

    build(game) {
        game.terrain.clear();
        if (this.buildFunction) {
            this.buildFunction(game);
        } else {
            this.buildDefault(game);
        }
    }

    buildDefault(game) {
        const w = game.width, h = game.height;
        game.terrain.addRect(0, h - 40, w, 40, 'dirt');
        game.terrain.setEntry(60, 60);
        game.terrain.setExit(w - 100, h - 64);
    }
}

/**
 * Level manager
 */
export class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = [];
        this.currentLevel = null;
        this.createLevels();
    }

    getAllLevels()    { return this.levels; }
    getCurrentLevel() { return this.currentLevel; }

    loadLevel(id) {
        const level = this.levels.find(l => l.id === id);
        if (!level) return false;
        // Restore original ability counts on retry
        if (level._originalAbilities) {
            level.abilities = { ...level._originalAbilities };
        }
        this.currentLevel = level;
        level.build(this.game);
        return true;
    }

    /* ── Level definitions ────────────────────────────────── */

    createLevels() {
        // ─── Level 1 : Just Dig! ───────────────────────────
        this.levels.push(new Level(1, 'Just Dig!', {
            lemmingCount: 10,
            releaseRate: 0.8,
            timeLimit: 300,
            requiredSaveCount: 5,
            abilities: {
                climber: 0, floater: 0, bomber: 0, blocker: 0,
                builder: 0, basher: 0, miner: 0, digger: 10
            },
            buildFunction: (game) => {
                const w = game.width, h = game.height;

                // Top platform (entry)
                game.terrain.addRect(80, 120, 200, 20, 'dirt');
                game.terrain.setEntry(150, 96);

                // Thick middle layer — lemmings must dig through
                game.terrain.addRect(0, 250, w, 60, 'dirt');

                // Ground
                game.terrain.addRect(0, h - 40, w, 40, 'dirt');

                // Exit on the ground
                game.terrain.setExit(w / 2 - 16, h - 64);
            }
        }));

        // ─── Level 2 : Bridge the Gap ──────────────────────
        this.levels.push(new Level(2, 'Bridge the Gap', {
            lemmingCount: 10,
            releaseRate: 0.7,
            timeLimit: 300,
            requiredSaveCount: 6,
            abilities: {
                climber: 0, floater: 2, bomber: 0, blocker: 1,
                builder: 5, basher: 0, miner: 0, digger: 0
            },
            buildFunction: (game) => {
                const w = game.width, h = game.height;

                // Left platform
                game.terrain.addRect(0, h - 50, w / 2 - 60, 50, 'dirt');

                // Right platform
                game.terrain.addRect(w / 2 + 60, h - 50, w / 2 - 60, 50, 'dirt');

                // Entry above left platform
                game.terrain.addRect(60, 160, 140, 16, 'dirt');
                game.terrain.setEntry(100, 136);

                // Ramp from entry to left ground
                for (let i = 0; i < 6; i++) {
                    game.terrain.addRect(60 + i * 20, 176 + i * 40, 80, 10, 'dirt');
                }

                // Exit on right platform
                game.terrain.setExit(w - 120, h - 74);
            }
        }));

        // ─── Level 3 : Bash Through ────────────────────────
        this.levels.push(new Level(3, 'Bash Through', {
            lemmingCount: 15,
            releaseRate: 1,
            timeLimit: 240,
            requiredSaveCount: 10,
            abilities: {
                climber: 0, floater: 0, bomber: 0, blocker: 2,
                builder: 0, basher: 5, miner: 0, digger: 0
            },
            buildFunction: (game) => {
                const w = game.width, h = game.height;

                // Ground
                game.terrain.addRect(0, h - 40, w, 40, 'dirt');

                // Entry platform
                game.terrain.addRect(30, 180, 120, 14, 'dirt');
                game.terrain.setEntry(70, 156);

                // Slope from entry to ground
                for (let i = 0; i < 5; i++) {
                    game.terrain.addRect(30, 194 + i * 50, 100 - i * 10, 10, 'dirt');
                }

                // Three rock walls blocking the path
                game.terrain.addRect(280, h - 140, 20, 100, 'rock');
                game.terrain.addRect(480, h - 140, 20, 100, 'rock');
                game.terrain.addRect(680, h - 140, 20, 100, 'rock');

                // Exit at far end
                game.terrain.setExit(w - 80, h - 64);
            }
        }));

        // ─── Level 4 : Mine Your Way ───────────────────────
        this.levels.push(new Level(4, 'Mine Your Way', {
            lemmingCount: 12,
            releaseRate: 0.8,
            timeLimit: 300,
            requiredSaveCount: 8,
            abilities: {
                climber: 0, floater: 3, bomber: 0, blocker: 0,
                builder: 0, basher: 0, miner: 5, digger: 2
            },
            buildFunction: (game) => {
                const w = game.width, h = game.height;

                // Entry high up
                game.terrain.addRect(100, 80, 150, 14, 'dirt');
                game.terrain.setEntry(150, 56);

                // Series of thick diagonal platforms — need to mine through
                game.terrain.addRect(60, 180, 300, 30, 'dirt');
                game.terrain.addRect(200, 300, 350, 30, 'dirt');
                game.terrain.addRect(100, 420, 300, 30, 'dirt');

                // Ground
                game.terrain.addRect(0, h - 40, w, 40, 'dirt');

                // Exit at bottom-right
                game.terrain.setExit(w - 100, h - 64);
            }
        }));

        // ─── Level 5 : The Climb ───────────────────────────
        this.levels.push(new Level(5, 'The Climb', {
            lemmingCount: 10,
            releaseRate: 0.6,
            timeLimit: 360,
            requiredSaveCount: 7,
            abilities: {
                climber: 10, floater: 5, bomber: 2, blocker: 2,
                builder: 3, basher: 0, miner: 0, digger: 0
            },
            buildFunction: (game) => {
                const w = game.width, h = game.height;

                // Ground
                game.terrain.addRect(0, h - 40, w, 40, 'dirt');

                // Entry on ground level
                game.terrain.setEntry(60, h - 64);

                // Tall walls to climb
                game.terrain.addRect(200, h - 200, 20, 160, 'rock');
                game.terrain.addRect(400, h - 280, 20, 240, 'rock');
                game.terrain.addRect(600, h - 200, 20, 160, 'rock');

                // Platforms at top of walls
                game.terrain.addRect(200, h - 200, 100, 14, 'dirt');
                game.terrain.addRect(400, h - 280, 100, 14, 'dirt');
                game.terrain.addRect(600, h - 200, 100, 14, 'dirt');

                // Exit high up on a platform
                game.terrain.addRect(780, h - 160, 120, 14, 'dirt');
                game.terrain.setExit(820, h - 184);
            }
        }));

        // ─── Level 6 : Combination ─────────────────────────
        this.levels.push(new Level(6, 'Use Them All', {
            lemmingCount: 20,
            releaseRate: 1,
            timeLimit: 420,
            requiredSaveCount: 15,
            abilities: {
                climber: 3, floater: 3, bomber: 2, blocker: 2,
                builder: 5, basher: 3, miner: 3, digger: 3
            },
            buildFunction: (game) => {
                const w = game.width, h = game.height;

                // Entry high-left
                game.terrain.addRect(40, 100, 160, 14, 'dirt');
                game.terrain.setEntry(90, 76);

                // Thick platform to dig through
                game.terrain.addRect(40, 200, 200, 40, 'dirt');

                // Rock wall to bash
                game.terrain.addRect(340, 200, 20, 200, 'rock');

                // Middle platform
                game.terrain.addRect(360, 300, 200, 14, 'dirt');

                // Gap needing a bridge
                // Right platform
                game.terrain.addRect(660, 300, 200, 14, 'dirt');

                // Thick layer to mine through
                game.terrain.addRect(600, 400, 300, 40, 'dirt');

                // Ground
                game.terrain.addRect(0, h - 40, w, 40, 'dirt');

                // Exit bottom-right
                game.terrain.setExit(w - 80, h - 64);
            }
        }));

        // Store original ability counts for retry
        for (const level of this.levels) {
            level._originalAbilities = { ...level.abilities };
        }
    }
}
