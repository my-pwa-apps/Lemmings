/**
 * Terrain system for the Lemmings game
 * Handles terrain rendering, collision detection and modification
 */
import { COLORS, rectsOverlap } from './utils.js';

export class Terrain {
    constructor(game, width, height) {
        this.game = game;
        this.width = width;
        this.height = height;
        
        // Create terrain canvas (used for collision detection)
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // Terrain data structures
        this.terrainSegments = []; // Stores terrain segments for rendering
        this.entry = null;         // Entry point coordinates
        this.exit = null;          // Exit point coordinates
        
        // Initialize with a blank terrain
        this.clear();
    }
    
    /**
     * Clear the terrain
     */
    clear() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.terrainSegments = [];
        this.entry = null;
        this.exit = null;
    }
    
    /**
     * Add a rectangular terrain segment
     */
    addRect(x, y, width, height, type = 'dirt') {
        this.terrainSegments.push({
            type: type,
            x: x,
            y: y,
            width: width,
            height: height
        });
        
        // Also add to collision canvas
        this.ctx.fillStyle = '#FF0000'; // Color doesn't matter, just needs to be opaque
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * Set the entry point
     */
    setEntry(x, y) {
        this.entry = { x, y };
    }
    
    /**
     * Set the exit point
     */
    setExit(x, y) {
        this.exit = { x, y };
    }
    
    /**
     * Check if a point collides with terrain
     */
    checkCollision(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return false;
        }
        
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        // Check if the pixel has any opacity (alpha > 0)
        return pixel[3] > 0;
    }
    
    /**
     * Check if a rectangle collides with terrain
     */
    checkRectCollision(x, y, width, height) {
        // For better performance, only check corners and center point
        return this.checkCollision(x, y) || 
               this.checkCollision(x + width, y) ||
               this.checkCollision(x, y + height) ||
               this.checkCollision(x + width, y + height) ||
               this.checkCollision(x + width/2, y + height/2);
    }
      /**
     * Find the floor below a point (for walking lemmings)
     */
    findFloorBelow(x, y, maxDistance = 10) {
        for (let checkY = y; checkY < y + maxDistance; checkY++) {
            // Check a few pixels horizontally around the point to better detect narrow bridges
            for (let xOffset = -1; xOffset <= 1; xOffset++) {
                if (this.checkCollision(x + xOffset, checkY)) {
                    return checkY - 1; // Return the y-coordinate just above the floor
                }
            }
        }
        return null; // No floor found within maxDistance
    }
    
    /**
     * Check if a point is at the exit
     */
    checkExit(x, y) {
        if (!this.exit) return false;
        
        return (x >= this.exit.x + 8 && x <= this.exit.x + 24 &&
                y >= this.exit.y && y <= this.exit.y + 16);
    }
    
    /**
     * Remove terrain in a circular area (for digging)
     */
    digCircle(x, y, radius) {
        // Clear in the collision canvas
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // We don't need to modify terrainSegments as we draw them underneath,
        // and the collision check will handle it correctly
    }
    
    /**
     * Remove terrain in a horizontal line (for bashing)
     */
    bashHorizontal(x, y, width, height) {
        // Clear in the collision canvas
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillRect(x, y - height/2, width, height);
        this.ctx.restore();
    }
    
    /**
     * Remove terrain in a diagonal line (for mining)
     */
    mineDigonal(x, y, width, height, direction) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        
        this.ctx.beginPath();
        if (direction > 0) {
            // Mine to the right
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + width, y + height);
            this.ctx.lineTo(x + width, y);
            this.ctx.closePath();
        } else {
            // Mine to the left
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - width, y + height);
            this.ctx.lineTo(x, y + height);
            this.ctx.closePath();
        }
        this.ctx.fill();
        
        this.ctx.restore();
    }    /**
     * Add a bridge segment (for building)
     */
    addBridge(x, y, width, height) {
        // Make bridges wider and thicker to ensure lemmings walk on them
        // Wider bridges are easier to walk on
        const enhancedWidth = width + 2;
        const enhancedHeight = height + 1;
        
        this.addRect(x - 1, y, enhancedWidth, enhancedHeight, 'dirt');
        
        // Add a visual indicator that this is a bridge
        this.addRect(x - 1, y + enhancedHeight, enhancedWidth, 1, 'rock');
        
        // Add some debug logging
        console.log("Enhanced bridge built at:", x, y, "width:", enhancedWidth, "height:", enhancedHeight);
    }
    
    /**
     * Render the terrain to the game canvas
     */
    render(ctx) {
        // Draw all terrain segments
        this.terrainSegments.forEach(segment => {
            this.game.assets.drawTerrain(
                ctx, 
                segment.x, 
                segment.y, 
                segment.width, 
                segment.height, 
                segment.type
            );
        });
        
        // Draw entry and exit points
        if (this.entry) {
            this.game.assets.drawEntry(ctx, this.entry.x, this.entry.y);
        }
        
        if (this.exit) {
            this.game.assets.drawExit(ctx, this.exit.x, this.exit.y);
        }
    }    /**
     * Debug rendering to visualize collision map
     */
    debugRender(ctx) {
        // Draw collision map with semi-transparency
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.drawImage(this.canvas, 0, 0);
        
        // Highlight the gap if this is level 1
        if (this.game.levelManager && 
            this.game.levelManager.currentLevel && 
            this.game.levelManager.currentLevel.id === 1) {
            
            const width = this.game.width;
            const height = this.game.height;
            const gapWidth = 100;
            const gapX = width/2 - gapWidth/2;
            
            // Draw a highlight around the gap
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'red';
            ctx.fillRect(gapX, height - 70, gapWidth, 40);
            
            // Draw border around gap
            ctx.globalAlpha = 0.8;
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.strokeRect(gapX, height - 70, gapWidth, 40);
            
            // Add text indicating "GAP HERE!"
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'red';
            ctx.font = '18px Arial';
            ctx.fillText('GAP HERE!', gapX + 10, height - 80);
            
            // Draw bridge-building hints
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.fillText('1. Select Builder ability (5)', 20, 200);
            ctx.fillText('2. Click on lemming at edge of gap', 20, 220);
            ctx.fillText('3. Wait for bridge to complete', 20, 240);
        }
        ctx.restore();
    }
}
