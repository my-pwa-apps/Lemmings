import { COLORS } from './utils.js';

/**
 * Assets generation for the Lemmings game
 * All visual elements are procedurally generated here instead of loading image files
 */

export class Assets {
    constructor(game) {
        this.game = game;
        this.sprites = {};
        this.animations = {};
        this.generateAssets();
    }

    /**
     * Generate all game assets
     */
    generateAssets() {
        this.generateLemmingSprites();
        this.generateTerrainPatterns();
        this.generateParticleEffects();
    }

    /**
     * Generate lemming sprites for different states
     */
    generateLemmingSprites() {
        const states = [
            'walking', 'falling', 'climbing', 
            'digging', 'building', 'blocking',
            'bashing', 'mining', 'floating',
            'exploding', 'exiting'
        ];
        
        states.forEach(state => {
            this.generateLemmingAnimation(state);
        });
    }

    /**
     * Generate lemming animation for a specific state
     */
    generateLemmingAnimation(state) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frameCount = this.getFrameCountForState(state);
        const width = 8; // Lemming width
        const height = 10; // Lemming height
        
        canvas.width = width * frameCount;
        canvas.height = height;
        
        // Generate frames for this animation
        for (let frame = 0; frame < frameCount; frame++) {
            this.drawLemmingFrame(ctx, frame * width, 0, state, frame);
        }
        
        // Store the animation canvas
        this.sprites[state] = canvas;
        
        // Create animation data
        this.animations[state] = {
            frameCount: frameCount,
            frameWidth: width,
            frameHeight: height,
            frameDuration: this.getFrameDurationForState(state)
        };
    }
    
    /**
     * Get frame count for a specific lemming state
     */
    getFrameCountForState(state) {
        switch (state) {
            case 'walking': return 8;
            case 'falling': return 4;
            case 'climbing': return 8;
            case 'digging': return 8;
            case 'building': return 16;
            case 'blocking': return 4;
            case 'bashing': return 8;
            case 'mining': return 16;
            case 'floating': return 8;
            case 'exploding': return 16;
            case 'exiting': return 16;
            default: return 4;
        }
    }
    
    /**
     * Get animation frame duration for a specific lemming state
     */
    getFrameDurationForState(state) {
        switch (state) {
            case 'walking': return 100;
            case 'falling': return 100;
            case 'climbing': return 100;
            case 'digging': return 100;
            case 'building': return 100;
            case 'blocking': return 200;
            case 'bashing': return 100;
            case 'mining': return 100;
            case 'floating': return 100;
            case 'exploding': return 200;
            case 'exiting': return 100;
            default: return 100;
        }
    }

    /**
     * Draw a single frame of a lemming in a specific state
     */
    drawLemmingFrame(ctx, x, y, state, frameIndex) {
        // Common lemming properties
        const bodyColor = COLORS.LEMMING.BODY;
        const hairColor = COLORS.LEMMING.HAIR;
        const outfitColor = COLORS.LEMMING.OUTFIT;
        
        // Clear the frame area
        ctx.clearRect(x, y, 8, 10);
        
        // Draw based on state and frame
        switch (state) {
            case 'walking':
                this.drawWalkingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'falling':
                this.drawFallingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'climbing':
                this.drawClimbingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'digging':
                this.drawDiggingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'building':
                this.drawBuildingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'blocking':
                this.drawBlockingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'bashing':
                this.drawBashingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'mining':
                this.drawMiningLemming(ctx, x, y, frameIndex);
                break;
                
            case 'floating':
                this.drawFloatingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'exploding':
                this.drawExplodingLemming(ctx, x, y, frameIndex);
                break;
                
            case 'exiting':
                this.drawExitingLemming(ctx, x, y, frameIndex);
                break;
                
            default:
                // Default simple lemming shape
                ctx.fillStyle = bodyColor;
                ctx.fillRect(x + 2, y + 2, 4, 6);
                ctx.fillStyle = hairColor;
                ctx.fillRect(x + 2, y, 4, 2);
        }
    }

    /**
     * Draw walking lemming animation frame
     */
    drawWalkingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms
        const armPhase = frameIndex % 4;
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        if (armPhase === 0) {
            // Arms out
            ctx.fillRect(x + 1, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 3, 1, 2); // Right arm
        } else if (armPhase === 1) {
            // Arms up
            ctx.fillRect(x + 1, y + 2, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 2, 1, 2); // Right arm
        } else if (armPhase === 2) {
            // Arms in
            ctx.fillRect(x + 2, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 5, y + 3, 1, 2); // Right arm
        } else {
            // Arms down
            ctx.fillRect(x + 2, y + 4, 1, 2); // Left arm
            ctx.fillRect(x + 5, y + 4, 1, 2); // Right arm
        }
        
        // Legs
        const legPhase = frameIndex % 4;
        if (legPhase === 0 || legPhase === 2) {
            // Legs spread
            ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg
            ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg
        } else if (legPhase === 1) {
            // Right leg forward
            ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg at back
            ctx.fillRect(x + 6, y + 8, 1, 2); // Right leg at front
        } else {
            // Left leg forward
            ctx.fillRect(x + 1, y + 8, 1, 2); // Left leg at front
            ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg at back
        }
    }

    /**
     * Draw falling lemming animation frame
     */
    drawFallingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms up in panic
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        if (frameIndex % 2 === 0) {
            // Arms up
            ctx.fillRect(x + 1, y + 1, 1, 3); // Left arm
            ctx.fillRect(x + 6, y + 1, 1, 3); // Right arm
        } else {
            // Arms more up
            ctx.fillRect(x + 1, y + 0, 1, 3); // Left arm
            ctx.fillRect(x + 6, y + 0, 1, 3); // Right arm
        }
        
        // Legs kicking
        if (frameIndex % 2 === 0) {
            ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg
            ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg
        } else {
            ctx.fillRect(x + 1, y + 8, 1, 2); // Left leg
            ctx.fillRect(x + 6, y + 8, 1, 2); // Right leg
        }
    }

    /**
     * Draw climbing lemming animation frame
     */
    drawClimbingLemming(ctx, x, y, frameIndex) {
        // Body - shifted to look like it's against a wall
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 3, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 3, y + 0, 4, 2);
        
        // Arms - gripping the wall
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Alternate arm positions for climbing motion
        if (frameIndex % 4 === 0) {
            ctx.fillRect(x + 1, y + 2, 2, 1); // Left arm top
            ctx.fillRect(x + 1, y + 5, 2, 1); // Right arm bottom
        } else if (frameIndex % 4 === 1) {
            ctx.fillRect(x + 1, y + 3, 2, 1); // Left arm middle
            ctx.fillRect(x + 1, y + 6, 2, 1); // Right arm middle bottom
        } else if (frameIndex % 4 === 2) {
            ctx.fillRect(x + 1, y + 4, 2, 1); // Left arm bottom
            ctx.fillRect(x + 1, y + 1, 2, 1); // Right arm top
        } else {
            ctx.fillRect(x + 1, y + 5, 2, 1); // Left arm middle bottom
            ctx.fillRect(x + 1, y + 2, 2, 1); // Right arm middle top
        }
        
        // Legs - pushing against the wall
        if (frameIndex % 2 === 0) {
            ctx.fillRect(x + 4, y + 8, 2, 1); // Left leg
            ctx.fillRect(x + 3, y + 9, 3, 1); // Right leg
        } else {
            ctx.fillRect(x + 3, y + 8, 3, 1); // Left leg
            ctx.fillRect(x + 4, y + 9, 2, 1); // Right leg
        }
    }

    /**
     * Draw digging lemming animation frame
     */
    drawDiggingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 5);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms and shovel
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Animation of digging motion
        if (frameIndex % 4 === 0) {
            // Arms up with shovel
            ctx.fillRect(x + 1, y + 2, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 2, 1, 2); // Right arm
            ctx.fillRect(x + 2, y + 1, 4, 1); // Shovel top
        } else if (frameIndex % 4 === 1) {
            // Arms mid with shovel
            ctx.fillRect(x + 1, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 3, 1, 2); // Right arm
            ctx.fillRect(x + 2, y + 2, 4, 1); // Shovel mid
        } else if (frameIndex % 4 === 2) {
            // Arms down with shovel
            ctx.fillRect(x + 1, y + 4, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 4, 1, 2); // Right arm
            ctx.fillRect(x + 2, y + 6, 4, 1); // Shovel down
        } else {
            // Arms mid, returning up
            ctx.fillRect(x + 1, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 3, 1, 2); // Right arm
            ctx.fillRect(x + 2, y + 3, 4, 1); // Shovel mid
        }
        
        // Legs
        ctx.fillRect(x + 2, y + 7, 1, 3); // Left leg
        ctx.fillRect(x + 5, y + 7, 1, 3); // Right leg
    }

    /**
     * Draw building lemming animation frame
     */
    drawBuildingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms and brick
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Animation cycle - place brick, reach for next one
        const cycleFrame = frameIndex % 8;
        
        if (cycleFrame < 2) {
            // Holding brick in front
            ctx.fillRect(x + 6, y + 4, 2, 1); // Brick
            ctx.fillRect(x + 5, y + 3, 1, 3); // Right arm
            ctx.fillRect(x + 1, y + 3, 1, 3); // Left arm
        } else if (cycleFrame < 4) {
            // Placing brick down
            ctx.fillRect(x + 6, y + 6, 2, 1); // Brick
            ctx.fillRect(x + 5, y + 4, 1, 2); // Right arm
            ctx.fillRect(x + 1, y + 3, 1, 3); // Left arm
        } else if (cycleFrame < 6) {
            // Reaching back for next brick
            ctx.fillRect(x + 1, y + 3, 1, 3); // Left arm holding
            ctx.fillRect(x + 1, y + 4, 2, 1); // Right arm reaching back
        } else {
            // Bringing next brick forward
            ctx.fillRect(x + 0, y + 4, 2, 1); // Brick
            ctx.fillRect(x + 2, y + 3, 1, 3); // Right arm
            ctx.fillRect(x + 1, y + 3, 1, 3); // Left arm
        }
        
        // Legs
        ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg
        ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg
    }

    /**
     * Draw blocking lemming animation frame
     */
    drawBlockingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms spread wide to block
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Alternating arm position slightly
        if (frameIndex % 2 === 0) {
            ctx.fillRect(x + 0, y + 3, 2, 1); // Left arm
            ctx.fillRect(x + 6, y + 3, 2, 1); // Right arm
        } else {
            ctx.fillRect(x + 0, y + 4, 2, 1); // Left arm
            ctx.fillRect(x + 6, y + 4, 2, 1); // Right arm
        }
        
        // Legs spread
        ctx.fillRect(x + 1, y + 8, 2, 2); // Left leg
        ctx.fillRect(x + 5, y + 8, 2, 2); // Right leg
    }

    /**
     * Draw bashing lemming animation frame
     */
    drawBashingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms and tool
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Bashing animation
        const cycleFrame = frameIndex % 4;
        
        if (cycleFrame === 0) {
            // Arms back with tool
            ctx.fillRect(x + 1, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 0, y + 2, 1, 4); // Tool back
        } else if (cycleFrame === 1) {
            // Arms mid-swing
            ctx.fillRect(x + 2, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 3, y + 2, 2, 1); // Tool mid
        } else if (cycleFrame === 2) {
            // Arms forward with tool
            ctx.fillRect(x + 5, y + 3, 1, 2); // Right arm
            ctx.fillRect(x + 6, y + 2, 1, 4); // Tool forward
        } else {
            // Arms recovering
            ctx.fillRect(x + 3, y + 3, 2, 1); // Arms mid
            ctx.fillRect(x + 3, y + 4, 2, 1); // Tool recovering
        }
        
        // Legs
        ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg
        ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg
    }

    /**
     * Draw mining lemming animation frame
     */
    drawMiningLemming(ctx, x, y, frameIndex) {
        // Body - leaning forward
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 3, y + 2, 4, 5);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 3, y + 0, 4, 2);
        
        // Arms and tool
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Mining animation
        const cycleFrame = frameIndex % 8;
        
        if (cycleFrame < 2) {
            // Tool raised high
            ctx.fillRect(x + 1, y + 2, 2, 1); // Left arm
            ctx.fillRect(x + 6, y + 2, 1, 2); // Right arm
            ctx.fillRect(x + 3, y + 0, 1, 2); // Pickaxe handle
            ctx.fillRect(x + 2, y + 1, 3, 1); // Pickaxe head
        } else if (cycleFrame < 4) {
            // Tool mid-swing
            ctx.fillRect(x + 2, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 3, 1, 2); // Right arm
            ctx.fillRect(x + 3, y + 2, 1, 3); // Pickaxe handle
            ctx.fillRect(x + 2, y + 3, 3, 1); // Pickaxe head
        } else if (cycleFrame < 6) {
            // Tool hitting ground
            ctx.fillRect(x + 2, y + 4, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 4, 1, 2); // Right arm
            ctx.fillRect(x + 3, y + 4, 1, 4); // Pickaxe handle
            ctx.fillRect(x + 2, y + 6, 3, 1); // Pickaxe head
            
            // Show impact
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 2, y + 7, 1, 1); // Spark
            ctx.fillRect(x + 4, y + 7, 1, 1); // Spark
        } else {
            // Returning to starting position
            ctx.fillRect(x + 1, y + 3, 2, 1); // Left arm
            ctx.fillRect(x + 6, y + 3, 1, 2); // Right arm
            ctx.fillRect(x + 3, y + 2, 1, 3); // Pickaxe handle
            ctx.fillRect(x + 2, y + 2, 3, 1); // Pickaxe head
        }
        
        // Legs
        ctx.fillRect(x + 3, y + 7, 1, 3); // Left leg
        ctx.fillRect(x + 6, y + 7, 1, 3); // Right leg
    }

    /**
     * Draw floating lemming animation frame
     */
    drawFloatingLemming(ctx, x, y, frameIndex) {
        // Body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        
        // Hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);
        
        // Arms and umbrella
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        
        // Draw umbrella
        ctx.fillRect(x + 1, y - 2, 6, 1); // Umbrella top
        ctx.fillRect(x + 0, y - 1, 8, 1); // Umbrella middle
        ctx.fillRect(x + 4, y - 1, 1, 3); // Umbrella handle
        
        // Arms holding umbrella
        ctx.fillRect(x + 2, y + 2, 1, 1); // Left arm
        ctx.fillRect(x + 5, y + 2, 1, 1); // Right arm
        
        // Legs swinging gently
        if (frameIndex % 4 < 2) {
            ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg
            ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg
        } else {
            ctx.fillRect(x + 3, y + 8, 1, 2); // Left leg
            ctx.fillRect(x + 4, y + 8, 1, 2); // Right leg
        }
    }

    /**
     * Draw exploding lemming animation frame
     */
    drawExplodingLemming(ctx, x, y, frameIndex) {
        // First phase: countdown blinking
        if (frameIndex < 8) {
            // Body - blinking between normal and white
            ctx.fillStyle = frameIndex % 2 === 0 ? COLORS.LEMMING.BODY : '#FFFFFF';
            ctx.fillRect(x + 2, y + 2, 4, 6);
            
            // Hair
            ctx.fillStyle = frameIndex % 2 === 0 ? COLORS.LEMMING.HAIR : '#FFFFFF';
            ctx.fillRect(x + 2, y + 0, 4, 2);
            
            // Arms and legs
            ctx.fillStyle = frameIndex % 2 === 0 ? COLORS.LEMMING.OUTFIT : '#FFFFFF';
            ctx.fillRect(x + 1, y + 3, 1, 2); // Left arm
            ctx.fillRect(x + 6, y + 3, 1, 2); // Right arm
            ctx.fillRect(x + 2, y + 8, 1, 2); // Left leg
            ctx.fillRect(x + 5, y + 8, 1, 2); // Right leg
        } else {
            // Second phase: explosion
            const explosionSize = (frameIndex - 8) * 2;
            const explosionColor = frameIndex % 2 === 0 ? '#FFFFFF' : '#FF0000';
            
            // Draw explosion circle
            ctx.fillStyle = explosionColor;
            ctx.beginPath();
            ctx.arc(x + 4, y + 5, explosionSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw explosion particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const distance = explosionSize * 0.8;
                const particleX = x + 4 + Math.cos(angle) * distance;
                const particleY = y + 5 + Math.sin(angle) * distance;
                
                ctx.fillRect(particleX, particleY, 1, 1);
            }
        }
    }

    /**
     * Draw exiting lemming animation frame
     */
    drawExitingLemming(ctx, x, y, frameIndex) {
        // Simple animation of lemming shrinking as it enters the exit
        const shrinkFactor = 1 - (frameIndex / 16);
        
        if (shrinkFactor <= 0) {
            return; // Completely exited
        }
        
        const centerX = x + 4;
        const centerY = y + 5;
        const width = 4 * shrinkFactor;
        const height = 8 * shrinkFactor;
        
        // Shrinking body
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(centerX - width/2, centerY - height/2, width, height);
        
        // Shrinking hair
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        const hairHeight = 2 * shrinkFactor;
        ctx.fillRect(centerX - width/2, centerY - height/2 - hairHeight, width, hairHeight);
        
        // Shrinking limbs
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const limbSize = 1 * shrinkFactor;
        
        // Draw arms and legs only if still visible
        if (limbSize >= 0.5) {
            // Arms
            ctx.fillRect(centerX - width/2 - limbSize, centerY - height/4, limbSize, height/3);
            ctx.fillRect(centerX + width/2, centerY - height/4, limbSize, height/3);
            
            // Legs
            ctx.fillRect(centerX - width/4, centerY + height/2 - limbSize, limbSize, limbSize * 2);
            ctx.fillRect(centerX + width/4 - limbSize, centerY + height/2 - limbSize, limbSize, limbSize * 2);
        }
    }

    /**
     * Generate terrain patterns
     */
    generateTerrainPatterns() {
        // Dirt pattern
        this.terrainPatterns = {};
        this.terrainPatterns.dirt = this.generateTerrainPattern(
            COLORS.TERRAIN.DIRT, 
            [COLORS.TERRAIN.DIRT, '#A0522D'], 
            0.3
        );
        
        // Rock pattern
        this.terrainPatterns.rock = this.generateTerrainPattern(
            COLORS.TERRAIN.ROCK, 
            [COLORS.TERRAIN.ROCK, '#808080', '#A9A9A9'], 
            0.5
        );
    }
    
    /**
     * Generate a terrain pattern with base color and variants
     */
    generateTerrainPattern(baseColor, variantColors, noiseLevel) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 16;
        canvas.height = 16;
        
        // Fill with base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 16, 16);
        
        // Add noise with variant colors
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (Math.random() < noiseLevel) {
                    ctx.fillStyle = variantColors[Math.floor(Math.random() * variantColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        return canvas;
    }
    
    /**
     * Generate particle effects
     */
    generateParticleEffects() {
        // Add particle effects if needed
    }
    
    /**
     * Draw entry point sprite
     */
    drawEntry(ctx, x, y) {
        // Entry hatch (blue color)
        ctx.fillStyle = COLORS.TERRAIN.ENTRY;
        ctx.fillRect(x, y, 24, 20);
        
        // Entry opening (dark hole)
        ctx.fillStyle = '#000022';
        ctx.fillRect(x + 4, y + 10, 16, 10);
        
        // Entry details
        ctx.fillStyle = '#87CEEB'; // Light blue
        ctx.fillRect(x + 2, y + 2, 20, 2); // Top edge
        ctx.fillRect(x + 2, y + 6, 20, 2); // Middle edge
    }
    
    /**
     * Draw exit point sprite
     */
    drawExit(ctx, x, y) {
        // Exit base (green color)
        ctx.fillStyle = COLORS.TERRAIN.EXIT;
        ctx.fillRect(x, y, 32, 24);
        
        // Exit hole (dark)
        ctx.fillStyle = '#002200';
        ctx.fillRect(x + 8, y, 16, 16);
        
        // Exit details
        ctx.fillStyle = '#90EE90'; // Light green
        ctx.fillRect(x + 4, y + 18, 24, 2); // Bottom edge
        ctx.fillRect(x + 4, y + 22, 24, 2); // Base edge
        
        // Exit door (animated)
        const doorPhase = Math.floor(Date.now() / 500) % 2;
        if (doorPhase === 0) {
            ctx.fillStyle = '#AAFFAA';
            ctx.fillRect(x + 10, y + 2, 12, 10); // Door slightly open
        }
    }
    
    /**
     * Draw terrain segment
     */
    drawTerrain(ctx, x, y, width, height, type = 'dirt') {
        if (this.terrainPatterns && this.terrainPatterns[type]) {
            // Use pre-generated pattern
            const pattern = ctx.createPattern(this.terrainPatterns[type], 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(x, y, width, height);
        } else {
            // Fallback solid color if pattern not available
            ctx.fillStyle = COLORS.TERRAIN.DIRT;
            ctx.fillRect(x, y, width, height);
        }
    }
    
    /**
     * Draw animation frame
     */
    drawAnimationFrame(ctx, x, y, state, frameIndex, direction = 1) {
        const animation = this.animations[state];
        if (!animation) return;
        
        const sourceX = frameIndex % animation.frameCount * animation.frameWidth;
        
        ctx.save();
        
        if (direction < 0) {
            // Flip horizontally for left-facing lemmings
            ctx.scale(-1, 1);
            ctx.translate(-(x * 2 + animation.frameWidth * 2), 0);
            x = x * -1 - animation.frameWidth;
        }
        
        // Draw the sprite at 2x scale for better visibility
        ctx.drawImage(
            this.sprites[state],
            sourceX, 0, animation.frameWidth, animation.frameHeight,
            x, y, animation.frameWidth * 2, animation.frameHeight * 2
        );
        
        ctx.restore();
    }
}
