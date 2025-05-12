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
        switch(state) {
            case 'walking':
                this.drawWalkingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'falling':
                this.drawFallingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'climbing':
                this.drawClimbingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'digging':
                this.drawDiggingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'building':
                this.drawBuildingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'blocking':
                this.drawBlockingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'bashing':
                this.drawBashingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'mining':
                this.drawMiningLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'floating':
                this.drawFloatingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'exploding':
                this.drawExplodingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
                
            case 'exiting':
                this.drawExitingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor);
                break;
        }
    }
    
    /**
     * Draw a walking lemming
     */
    drawWalkingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Alternate legs for walking animation
        const legOffset = frameIndex % 2 === 0 ? 1 : -1;
        
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        
        // Head
        ctx.fillRect(x + 2, y, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 4, 4, 2);
        
        // Arms
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 1, y + 3, 1, 1);
        ctx.fillRect(x + 6, y + 3, 1, 1);
        
        // Legs
        ctx.fillRect(x + 2, y + 6, 1, 2 + legOffset);
        ctx.fillRect(x + 5, y + 6, 1, 2 - legOffset);
    }
    
    /**
     * Draw a falling lemming
     */
    drawFallingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        
        // Head
        ctx.fillRect(x + 2, y, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 4, 4, 2);
        
        // Arms raised up
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 1, y + 2, 1, 1);
        ctx.fillRect(x + 6, y + 2, 1, 1);
        
        // Legs spread out
        ctx.fillRect(x + 1, y + 7, 1, 2);
        ctx.fillRect(x + 6, y + 7, 1, 2);
    }
    
    /**
     * Draw a climbing lemming
     */
    drawClimbingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Alternate arms for climbing animation
        const armOffset = frameIndex % 2 === 0 ? 1 : 0;
        
        // Body (vertical)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 3, 6);
        
        // Head
        ctx.fillRect(x + 2, y, 3, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 3, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 5, 3, 2);
        
        // Arms (reaching up)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 1, y + 2 + armOffset, 1, 1);
        ctx.fillRect(x + 5, y + 2 - armOffset, 1, 1);
    }
    
    /**
     * Draw a digging lemming
     */
    drawDiggingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 3, 4, 3);
        
        // Head (slightly lower when digging)
        ctx.fillRect(x + 2, y + 1, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y + 1, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 5, 4, 2);
        
        // Arms digging motion
        ctx.fillStyle = bodyColor;
        if (frameIndex % 2 === 0) {
            // Arms raised
            ctx.fillRect(x + 1, y + 4, 1, 1);
            ctx.fillRect(x + 6, y + 4, 1, 1);
            // Legs bent
            ctx.fillRect(x + 2, y + 7, 1, 2);
            ctx.fillRect(x + 5, y + 7, 1, 2);
        } else {
            // Arms lowered
            ctx.fillRect(x + 1, y + 6, 1, 1);
            ctx.fillRect(x + 6, y + 6, 1, 1);
            // Legs straight
            ctx.fillRect(x + 2, y + 7, 1, 3);
            ctx.fillRect(x + 5, y + 7, 1, 3);
        }
    }
    
    /**
     * Draw a building lemming
     */
    drawBuildingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        
        // Head
        ctx.fillRect(x + 2, y, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 4, 4, 2);
        
        // Building animation
        if (frameIndex % 3 === 0) {
            // Placing block
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 6, y + 3, 1, 1); // Extended arm
            ctx.fillRect(x + 1, y + 3, 1, 1); // Normal arm
            // Legs
            ctx.fillRect(x + 2, y + 6, 1, 2);
            ctx.fillRect(x + 5, y + 6, 1, 2);
            
            // Block being placed
            ctx.fillStyle = COLORS.TERRAIN.DIRT;
            ctx.fillRect(x + 7, y + 6, 2, 1);
        } else if (frameIndex % 3 === 1) {
            // Preparing block
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 6, y + 3, 1, 1);
            ctx.fillRect(x + 1, y + 2, 1, 1); // Raised arm
            // Legs
            ctx.fillRect(x + 2, y + 6, 1, 2);
            ctx.fillRect(x + 5, y + 6, 1, 3);
        } else {
            // Reaching for block
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 6, y + 3, 1, 1);
            ctx.fillRect(x + 1, y + 4, 1, 1); // Lowered arm
            // Legs
            ctx.fillRect(x + 2, y + 6, 1, 3);
            ctx.fillRect(x + 5, y + 6, 1, 2);
        }
    }
    
    /**
     * Draw a blocking lemming
     */
    drawBlockingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        
        // Head
        ctx.fillRect(x + 2, y, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 4, 4, 2);
        
        // Arms stretched out to block
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x, y + 3, 2, 1);
        ctx.fillRect(x + 6, y + 3, 2, 1);
        
        // Legs slightly apart
        ctx.fillRect(x + 2, y + 6, 1, 2);
        ctx.fillRect(x + 5, y + 6, 1, 2);
    }
    
    /**
     * Draw a bashing lemming
     */
    drawBashingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        
        // Head
        ctx.fillRect(x + 2, y, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 4, 4, 2);
        
        // Bashing animation
        if (frameIndex % 2 === 0) {
            // Arm forward bash
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 6, y + 3, 2, 1);
            ctx.fillRect(x + 1, y + 3, 1, 1);
        } else {
            // Arm back pre-bash
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 6, y + 3, 1, 1);
            ctx.fillRect(x, y + 3, 2, 1);
        }
        
        // Legs
        ctx.fillRect(x + 2, y + 6, 1, 2);
        ctx.fillRect(x + 5, y + 6, 1, 2);
    }
    
    /**
     * Draw a mining lemming
     */
    drawMiningLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Mining at an angle
        ctx.fillStyle = bodyColor;
        
        if (frameIndex % 3 === 0) {
            // First frame - preparing to mine
            // Angled body
            ctx.fillRect(x + 2, y + 2, 4, 4);
            
            // Head
            ctx.fillRect(x + 2, y, 4, 2);
            
            // Hair
            ctx.fillStyle = hairColor;
            ctx.fillRect(x + 2, y, 4, 1);
            
            // Outfit
            ctx.fillStyle = outfitColor;
            ctx.fillRect(x + 2, y + 4, 4, 2);
            
            // Arms
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 1, y + 3, 1, 1);
            ctx.fillRect(x + 6, y + 3, 1, 1);
            
            // Legs
            ctx.fillRect(x + 2, y + 6, 1, 2);
            ctx.fillRect(x + 5, y + 6, 1, 2);
        } else if (frameIndex % 3 === 1) {
            // Second frame - mining down
            // Angled body
            ctx.fillRect(x + 3, y + 3, 3, 4);
            
            // Head
            ctx.fillRect(x + 3, y + 1, 3, 2);
            
            // Hair
            ctx.fillStyle = hairColor;
            ctx.fillRect(x + 3, y + 1, 3, 1);
            
            // Outfit
            ctx.fillStyle = outfitColor;
            ctx.fillRect(x + 3, y + 5, 3, 2);
            
            // Mining arm
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 1, y + 5, 2, 1);
            ctx.fillRect(x + 6, y + 3, 1, 1);
            
            // Legs
            ctx.fillRect(x + 4, y + 7, 1, 2);
            ctx.fillRect(x + 6, y + 6, 1, 2);
        } else {
            // Third frame - mining forward
            // Angled body
            ctx.fillRect(x + 2, y + 4, 4, 4);
            
            // Head
            ctx.fillRect(x + 2, y + 2, 4, 2);
            
            // Hair
            ctx.fillStyle = hairColor;
            ctx.fillRect(x + 2, y + 2, 4, 1);
            
            // Outfit
            ctx.fillStyle = outfitColor;
            ctx.fillRect(x + 2, y + 6, 4, 2);
            
            // Mining arm
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x, y + 4, 2, 1);
            ctx.fillRect(x + 6, y + 4, 1, 1);
            
            // Legs
            ctx.fillRect(x + 2, y + 8, 1, 1);
            ctx.fillRect(x + 5, y + 8, 1, 1);
        }
    }
    
    /**
     * Draw a floating lemming
     */
    drawFloatingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 2, 4, 4);
        
        // Head
        ctx.fillRect(x + 2, y, 4, 2);
        
        // Hair
        ctx.fillStyle = hairColor;
        ctx.fillRect(x + 2, y, 4, 1);
        
        // Outfit
        ctx.fillStyle = outfitColor;
        ctx.fillRect(x + 2, y + 4, 4, 2);
        
        // Umbrella animation
        if (frameIndex % 2 === 0) {
            // Umbrella open
            // Arms holding umbrella
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 1, y + 2, 1, 1);
            ctx.fillRect(x + 6, y + 2, 1, 1);
            
            // Umbrella
            ctx.fillStyle = '#FF0000'; // Red umbrella
            ctx.fillRect(x, y - 2, 8, 1);
            ctx.fillRect(x + 1, y - 1, 6, 1);
            ctx.fillRect(x + 3, y - 2, 2, 3);
        } else {
            // Umbrella slightly fluttering
            // Arms holding umbrella
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 1, y + 2, 1, 1);
            ctx.fillRect(x + 6, y + 2, 1, 1);
            
            // Umbrella
            ctx.fillStyle = '#FF0000'; // Red umbrella
            ctx.fillRect(x, y - 1, 8, 1);
            ctx.fillRect(x + 1, y - 2, 6, 1);
            ctx.fillRect(x + 3, y - 2, 2, 3);
        }
        
        // Legs dangling
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 2, y + 6, 1, 2);
        ctx.fillRect(x + 5, y + 6, 1, 2);
    }
    
    /**
     * Draw an exploding lemming
     */
    drawExplodingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        const explosionFrames = 4;
        
        if (frameIndex < explosionFrames) {
            // Pre-explosion blinking
            // Body
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 2, y + 2, 4, 4);
            
            // Head
            ctx.fillRect(x + 2, y, 4, 2);
            
            // Hair
            ctx.fillStyle = frameIndex % 2 === 0 ? hairColor : '#FF0000';
            ctx.fillRect(x + 2, y, 4, 1);
            
            // Outfit
            ctx.fillStyle = outfitColor;
            ctx.fillRect(x + 2, y + 4, 4, 2);
            
            // Arms
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 1, y + 3, 1, 1);
            ctx.fillRect(x + 6, y + 3, 1, 1);
            
            // Legs
            ctx.fillRect(x + 2, y + 6, 1, 2);
            ctx.fillRect(x + 5, y + 6, 1, 2);
        } else {
            // Explosion
            ctx.fillStyle = '#FF0000';
            const explosionPhase = frameIndex - explosionFrames;
            const radius = explosionPhase * 2;
            
            ctx.beginPath();
            ctx.arc(x + 4, y + 4, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Particles
            if (explosionPhase > 1) {
                ctx.fillStyle = '#FFFF00';
                for (let i = 0; i < explosionPhase * 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * radius * 0.8;
                    const px = Math.cos(angle) * dist;
                    const py = Math.sin(angle) * dist;
                    const size = Math.random() * 1.5 + 0.5;
                    ctx.fillRect(x + 4 + px - size/2, y + 4 + py - size/2, size, size);
                }
            }
        }
    }
    
    /**
     * Draw an exiting lemming
     */
    drawExitingLemming(ctx, x, y, frameIndex, bodyColor, hairColor, outfitColor) {
        // Gradually disappear into the exit
        const visibleHeight = 10 - Math.min(8, frameIndex);
        
        if (visibleHeight <= 0) return; // Fully exited
        
        // Body (partial)
        ctx.fillStyle = bodyColor;
        const bodyTop = Math.max(y + 2, y + 10 - visibleHeight);
        const bodyHeight = Math.min(4, y + 6 - bodyTop);
        if (bodyHeight > 0) {
            ctx.fillRect(x + 2, bodyTop, 4, bodyHeight);
        }
        
        // Head (only if still visible)
        if (visibleHeight > 6) {
            ctx.fillRect(x + 2, y, 4, 2);
            
            // Hair
            ctx.fillStyle = hairColor;
            ctx.fillRect(x + 2, y, 4, 1);
        }
        
        // Outfit (only if still visible)
        const outfitTop = Math.max(y + 4, y + 10 - visibleHeight);
        const outfitHeight = Math.min(2, y + 6 - outfitTop);
        if (outfitHeight > 0) {
            ctx.fillStyle = outfitColor;
            ctx.fillRect(x + 2, outfitTop, 4, outfitHeight);
        }
        
        // Arms (only if the right part is visible)
        if (visibleHeight > 5) {
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x + 1, y + 3, 1, 1);
            ctx.fillRect(x + 6, y + 3, 1, 1);
        }
        
        // Legs (only if still visible)
        if (visibleHeight > 2) {
            const legTop = Math.max(y + 6, y + 10 - visibleHeight);
            const legHeight = Math.min(2, y + 8 - legTop);
            if (legHeight > 0) {
                ctx.fillStyle = bodyColor;
                ctx.fillRect(x + 2, legTop, 1, legHeight);
                ctx.fillRect(x + 5, legTop, 1, legHeight);
            }
        }
    }

    /**
     * Get the frame count for a lemming state
     */
    getFrameCountForState(state) {
        switch(state) {
            case 'walking': return 4;
            case 'falling': return 2;
            case 'climbing': return 4;
            case 'digging': return 4;
            case 'building': return 3;
            case 'blocking': return 2;
            case 'bashing': return 4;
            case 'mining': return 6;
            case 'floating': return 4;
            case 'exploding': return 8;
            case 'exiting': return 10;
            default: return 2;
        }
    }

    /**
     * Get the frame duration (in ms) for a lemming state
     */
    getFrameDurationForState(state) {
        switch(state) {
            case 'exploding': return 150;
            case 'exiting': return 100;
            default: return 100;
        }
    }

    /**
     * Generate terrain patterns
     */
    generateTerrainPatterns() {
        // Dirt pattern
        this.sprites.dirt = this.generateTerrainPattern(
            COLORS.TERRAIN.DIRT, 
            [COLORS.TERRAIN.DIRT, '#A0522D'], 
            0.2
        );

        // Rock pattern
        this.sprites.rock = this.generateTerrainPattern(
            COLORS.TERRAIN.ROCK, 
            [COLORS.TERRAIN.ROCK, '#808080', '#A9A9A9'], 
            0.3
        );
        
        // Entry
        this.sprites.entry = this.generateEntrySprite();
        
        // Exit
        this.sprites.exit = this.generateExitSprite();
    }

    /**
     * Generate a terrain pattern
     */
    generateTerrainPattern(baseColor, variantColors, noiseLevel) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 16;
        canvas.height = 16;
        
        // Fill with base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                if (Math.random() < noiseLevel) {
                    ctx.fillStyle = variantColors[Math.floor(Math.random() * variantColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        return canvas;
    }

    /**
     * Generate entry sprite
     */
    generateEntrySprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 32;
        canvas.height = 24;
        
        // Base structure
        ctx.fillStyle = COLORS.TERRAIN.ENTRY;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Darker outline
        ctx.fillStyle = '#2E5984';
        ctx.fillRect(0, 0, canvas.width, 1);
        ctx.fillRect(0, 0, 1, canvas.height);
        ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
        ctx.fillRect(canvas.width - 1, 0, 1, canvas.height);
        
        // Entrance hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height - 1, 8, Math.PI, 0, true);
        ctx.fill();
        
        // Highlights
        ctx.fillStyle = '#6CA6D8';
        ctx.fillRect(2, 2, canvas.width - 4, 2);
        ctx.fillRect(2, 2, 2, canvas.height - 4);
        
        return canvas;
    }

    /**
     * Generate exit sprite
     */
    generateExitSprite() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 32;
        canvas.height = 24;
        
        // Base structure
        ctx.fillStyle = COLORS.TERRAIN.EXIT;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Darker outline
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, canvas.width, 1);
        ctx.fillRect(0, 0, 1, canvas.height);
        ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
        ctx.fillRect(canvas.width - 1, 0, 1, canvas.height);
        
        // Exit hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height - 1, 8, Math.PI, 0, true);
        ctx.fill();
        
        // Highlights
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(2, 2, canvas.width - 4, 2);
        ctx.fillRect(2, 2, 2, canvas.height - 4);
        
        // Exit sign
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(canvas.width / 2 - 6, 5, 12, 8);
        
        ctx.fillStyle = '#000000';
        ctx.fillText("EXIT", canvas.width / 2 - 5, 11);
        
        return canvas;
    }

    /**
     * Generate particle effects (explosions, digging particles, etc)
     */
    generateParticleEffects() {
        // These will be generated on demand when needed
    }

    /**
     * Draw a frame of an animation at specified position
     */
    drawAnimationFrame(ctx, x, y, state, frame, direction = 1) {
        if (!this.sprites[state]) return;
        
        const animation = this.animations[state];
        if (!animation) return;
        
        const frameX = (frame % animation.frameCount) * animation.frameWidth;
        
        if (direction === 1) {
            // Drawing facing right (default)
            ctx.drawImage(
                this.sprites[state],
                frameX, 0, 
                animation.frameWidth, animation.frameHeight,
                x, y,
                animation.frameWidth * 2, animation.frameHeight * 2
            );
        } else {
            // Drawing facing left (flipped)
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.sprites[state],
                frameX, 0, 
                animation.frameWidth, animation.frameHeight,
                -x - animation.frameWidth * 2, y,
                animation.frameWidth * 2, animation.frameHeight * 2
            );
            ctx.restore();
        }
    }

    /**
     * Draw terrain with the specified pattern
     */
    drawTerrain(ctx, x, y, width, height, type = 'dirt') {
        if (!this.sprites[type]) return;
        
        const pattern = ctx.createPattern(this.sprites[type], 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(x, y, width, height);
    }

    /**
     * Draw entry point
     */
    drawEntry(ctx, x, y) {
        if (!this.sprites.entry) return;
        ctx.drawImage(this.sprites.entry, x, y);
    }

    /**
     * Draw exit point
     */
    drawExit(ctx, x, y) {
        if (!this.sprites.exit) return;
        ctx.drawImage(this.sprites.exit, x, y);
    }
}
