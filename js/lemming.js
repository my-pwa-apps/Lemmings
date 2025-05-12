/**
 * Lemming entity class
 * Handles individual lemming behavior, states and rendering
 */
import { rectsOverlap } from './utils.js';

export class Lemming {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 8 * 2;  // Scaled width
        this.height = 10 * 2; // Scaled height
        
        // Movement
        this.direction = 1;  // 1 = right, -1 = left
        this.fallSpeed = 0;
        this.walkSpeed = 1;
        this.fallStartY = y;
        this.fallDistance = 0;
        
        // State management
        this.state = 'falling';
        this.nextState = null;
        this.stateTime = 0;
        this.animFrame = 0;
        
        // Special abilities
        this.abilities = {
            climber: false,
            floater: false,
            bomber: false,
            blocker: false,
            builder: false,
            basher: false,
            miner: false,
            digger: false
        };
        
        // Building properties
        this.bridgeSegmentsLeft = 0;
        
        // Bomber properties
        this.countdownTimer = 0;
        
        // Status
        this.active = true;
        this.saved = false;
    }
    
    /**
     * Reset lemming to initial state
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.direction = 1;
        this.fallSpeed = 0;
        this.setState('falling');
        
        // Reset abilities
        Object.keys(this.abilities).forEach(ability => {
            this.abilities[ability] = false;
        });
        
        this.bridgeSegmentsLeft = 0;
        this.countdownTimer = 0;
        
        this.active = true;
        this.saved = false;
    }
    
    /**
     * Set lemming state
     */
    setState(state, immediate = false) {
        if (immediate || this.state === 'falling' || state === 'exploding') {
            this.state = state;
            this.stateTime = 0;
            this.animFrame = 0;
            this.nextState = null;
            
            // Handle state-specific initialization
            if (state === 'building') {
                this.bridgeSegmentsLeft = 12; // Number of bridge segments to build
            } else if (state === 'exploding') {
                this.countdownTimer = 5; // 5-second countdown
            }
        } else {
            // Queue state change after current action completes
            this.nextState = state;
        }
    }
    
    /**
     * Grant an ability to this lemming
     */
    grantAbility(ability) {
        if (this.abilities.hasOwnProperty(ability)) {
            // Handle special ability cases
            if (ability === 'bomber') {
                this.setState('exploding', true);
            } else {
                this.abilities[ability] = true;
                
                // Immediately apply certain abilities
                if (ability === 'digger' && this.state === 'walking') {
                    this.setState('digging', true);
                } else if (ability === 'basher' && this.state === 'walking') {
                    this.setState('bashing', true);
                } else if (ability === 'miner' && this.state === 'walking') {
                    this.setState('mining', true);
                } else if (ability === 'builder' && this.state === 'walking') {
                    this.setState('building', true);
                } else if (ability === 'blocker' && this.state === 'walking') {
                    this.setState('blocking', true);
                }
            }
            return true;
        }
        return false;
    }
    
    /**
     * Update lemming logic
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.stateTime += deltaTime;
        
        // Update animation frame
        const animData = this.game.assets.animations[this.state];
        if (animData) {
            const frameDuration = animData.frameDuration / this.game.gameSpeed;
            this.animFrame = Math.floor(this.stateTime / frameDuration) % animData.frameCount;
        }
        
        // Handle specific state behaviors
        switch(this.state) {
            case 'walking':
                this.updateWalking();
                break;
                
            case 'falling':
                this.updateFalling();
                break;
                
            case 'climbing':
                this.updateClimbing();
                break;
                
            case 'digging':
                this.updateDigging();
                break;
                
            case 'building':
                this.updateBuilding();
                break;
                
            case 'blocking':
                this.updateBlocking();
                break;
                
            case 'bashing':
                this.updateBashing();
                break;
                
            case 'mining':
                this.updateMining();
                break;
                
            case 'floating':
                this.updateFloating();
                break;
                
            case 'exploding':
                this.updateExploding(deltaTime);
                break;
                
            case 'exiting':
                this.updateExiting();
                break;
        }
        
        // Check if reached the exit
        if (this.state !== 'exiting' && this.game.terrain.checkExit(this.x + this.width/2, this.y + this.height/2)) {
            this.setState('exiting', true);
        }
    }
    
    /**
     * Update walking behavior
     */
    updateWalking() {
        // Move in current direction
        this.x += this.direction * this.walkSpeed * this.game.gameSpeed;
        
        // Check if walking into a wall
        if (this.game.terrain.checkCollision(
                this.x + (this.direction > 0 ? this.width : 0), 
                this.y + this.height/2)) {
            
            // Try climbing if can climb
            if (this.abilities.climber) {
                this.setState('climbing', true);
            } else {
                // Turn around
                this.direction *= -1;
            }
            return;
        }
        
        // Check for floor
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width/2, this.y + this.height, 5);
        if (floorY === null) {
            // No floor below, start falling
            this.setState('falling', true);
        } else {
            // Stay on floor
            this.y = floorY - this.height + 1;
        }
    }
    
    /**
     * Update falling behavior
     */    updateFalling() {
        // Track fall distance
        if (this.fallSpeed === 0) {
            // Just started falling, record starting position
            this.fallStartY = this.y;
        }
        
        // Increase fall speed (gravity)
        this.fallSpeed = Math.min(5, this.fallSpeed + 0.1 * this.game.gameSpeed);
        
        // Limit fall speed if floater ability is active
        if (this.abilities.floater && this.fallSpeed > 1) {
            this.fallSpeed = 1;
            this.setState('floating');
            return;
        }
        
        // Move down
        this.y += this.fallSpeed * this.game.gameSpeed;
        
        // Calculate current fall distance
        this.fallDistance = this.y - this.fallStartY;
        
        // Check for landing
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width/2, this.y + this.height, 2);
        if (floorY !== null) {
            // Land on floor
            this.y = floorY - this.height + 1;
              // Play splat sound if falling from a great height and not a floater
            if (this.fallDistance > 110 && !this.abilities.floater) {
                this.game.sound.playSound('splat', 0.5);
                
                // Optional: kill lemming if falling from extreme height
                if (this.fallDistance > 150 && !this.abilities.floater) {
                    this.active = false;
                    return;
                }
            }
            
            this.fallSpeed = 0;
            this.fallDistance = 0;
            this.setState('walking', true);
        }
        
        // Check if fallen off screen
        if (this.y > this.game.height) {
            this.active = false;
        }
    }
    
    /**
     * Update climbing behavior
     */
    updateClimbing() {
        // Move upward
        this.y -= 1 * this.game.gameSpeed;
        
        // Check if there's still a wall to climb
        const hasWall = this.game.terrain.checkCollision(
            this.x + (this.direction > 0 ? this.width - 1 : 1),
            this.y + this.height/2
        );
        
        if (!hasWall) {
            // Reached top of the wall
            this.x += this.direction * 2; // Step onto the ledge
            this.setState('walking', true);
            return;
        }
        
        // Check if there's an obstruction above
        const hasObstruction = this.game.terrain.checkCollision(
            this.x + this.width/2,
            this.y
        );
        
        if (hasObstruction) {
            // Can't climb further, turn around and fall
            this.direction *= -1;
            this.setState('falling', true);
        }
    }
    
    /**
     * Update digging behavior
     */    updateDigging() {
        // Animate digging motion
        if (this.animFrame === 3) { // Last frame of digging animation
            // Dig a small circular area below
            this.game.terrain.digCircle(
                this.x + this.width/2, 
                this.y + this.height, 
                this.width/2
            );
            
            // Play digging sound
            this.game.sound.playSound('dig', 0.4);
            
            // Move down slightly as we dig
            this.y += 1 * this.game.gameSpeed;
        }
        
        // Check if we've dug through and need to fall
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width/2, this.y + this.height, 2);
        if (floorY === null) {
            this.setState('falling', true);
        }
    }
      /**
     * Update building behavior
     */    updateBuilding() {
        if (this.animFrame === 2) { // Third frame of building animation
            // Place a bridge segment - making it wider and more continuous
            this.game.terrain.addBridge(
                this.x + (this.direction > 0 ? this.width - 1 : -3),
                this.y + this.height - 2,
                6, // Wider bridge segment (was 4)
                1
            );
            
            // Play building sound
            this.game.sound.playSound('build', 0.4);
            
            // Move slightly up and forward - smaller steps for more continuous bridges
            this.x += this.direction * 1.5 * this.game.gameSpeed; // Slower horizontal movement for denser bridge
            this.y -= 1 * this.game.gameSpeed;
            
            // Check if we actually built a bridge segment by testing the terrain below
            const bridgeCheck = this.game.terrain.findFloorBelow(
                this.x + this.width/2,
                this.y + this.height, 
                5
            );
            
            // If no floor below, we might be at a gap edge - build an extra segment
            if (bridgeCheck === null) {
                this.game.terrain.addBridge(
                    this.x + (this.direction > 0 ? this.width : -3),
                    this.y + this.height - 1,
                    8, // Extra wide segment at edges
                    2  // Extra thick segment at edges
                );
            }
            
            this.bridgeSegmentsLeft--;
            
            // Check if we've built all segments
            if (this.bridgeSegmentsLeft <= 0) {
                this.setState('walking', true);
            }
            
            // Check if we've hit an obstacle
            if (this.game.terrain.checkCollision(
                this.x + (this.direction > 0 ? this.width : 0),
                this.y + this.height/2
            )) {
                this.setState('walking', true);
                this.direction *= -1; // Turn around
            }
        }
    }
    
    /**
     * Update blocking behavior
     */
    updateBlocking() {
        // Blockers just stand in place and prevent other lemmings from passing
        // Other lemmings will handle collision with this lemming
    }
    
    /**
     * Update bashing behavior
     */
    updateBashing() {
        if (this.animFrame === 3) { // Last frame of bashing animation
            // Bash a horizontal area in front
            this.game.terrain.bashHorizontal(
                this.x + (this.direction > 0 ? this.width : -this.width/2),
                this.y + this.height/2,
                this.width/2,
                this.height - 4
            );
            
            // Move forward slightly
            this.x += this.direction * 1 * this.game.gameSpeed;
        }
        
        // Check if there's still terrain to bash
        const hasTerrain = this.game.terrain.checkCollision(
            this.x + (this.direction > 0 ? this.width + 2 : -2),
            this.y + this.height/2
        );
        
        if (!hasTerrain) {
            // No more terrain to bash, go back to walking
            this.setState('walking', true);
        }
        
        // Check for floor
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width/2, this.y + this.height, 5);
        if (floorY === null) {
            // No floor below, start falling
            this.setState('falling', true);
        } else {
            // Stay on floor
            this.y = floorY - this.height + 1;
        }
    }
    
    /**
     * Update mining behavior
     */
    updateMining() {
        if (this.animFrame === 5) { // Last frame of mining animation
            // Mine a diagonal area in front and below
            this.game.terrain.mineDigonal(
                this.x + (this.direction > 0 ? this.width : 0),
                this.y + this.height/2,
                this.width,
                this.height/2,
                this.direction
            );
            
            // Move down and forward
            this.x += this.direction * 2 * this.game.gameSpeed;
            this.y += 2 * this.game.gameSpeed;
        }
        
        // Check if there's still terrain to mine
        const hasTerrain = this.game.terrain.checkCollision(
            this.x + (this.direction > 0 ? this.width + 1 : -1),
            this.y + this.height - 2
        );
        
        if (!hasTerrain) {
            // No more terrain to mine, go to falling state
            this.setState('falling', true);
        }
    }
    
    /**
     * Update floating behavior
     */
    updateFloating() {
        // Slow fall with umbrella
        this.y += 1 * this.game.gameSpeed;
        
        // Check for landing
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width/2, this.y + this.height, 2);
        if (floorY !== null) {
            // Land on floor
            this.y = floorY - this.height + 1;
            this.fallSpeed = 0;
            this.setState('walking', true);
        }
        
        // Check if fallen off screen
        if (this.y > this.game.height) {
            this.active = false;
        }
    }
      /**
     * Update exploding behavior
     */
    updateExploding(deltaTime) {
        // Handle countdown timer if we're in the pre-explosion phase
        if (this.animFrame < 4) {  // First 4 frames are blinking
            this.countdownTimer -= deltaTime / 1000;  // Convert to seconds
            
            if (this.countdownTimer <= 0) {
                // Skip to explosion frames
                this.stateTime = 4 * this.game.assets.animations[this.state].frameDuration;
            }
        } else if (this.animFrame === 7) {  // Last explosion frame
            // Create a big explosion
            this.game.terrain.digCircle(
                this.x + this.width/2,
                this.y + this.height/2,
                this.width
            );
            
            // Play explosion sound
            this.game.sound.playSound('explosion', 0.7);
            
            // Remove the lemming
            this.active = false;
        }
    }
      /**
     * Update exiting behavior
     */
    updateExiting() {
        // Play exit sound once when entering exit
        if (this.animFrame === 0 && this.stateTime < 50) {
            this.game.sound.playSound('exit', 0.5);
        }
        
        if (this.animFrame >= 9) {  // Last frame of exit animation
            // Lemming has fully exited
            this.active = false;
            this.saved = true;
            this.game.lemmingSaved();
        }
    }
    
    /**
     * Check collision with another lemming (for blocker interaction)
     */
    checkCollisionWithLemming(otherLemming) {
        if (!otherLemming.active || otherLemming.state !== 'blocking') return false;
        
        const myBox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        const otherBox = {
            x: otherLemming.x,
            y: otherLemming.y,
            width: otherLemming.width,
            height: otherLemming.height
        };
        
        return rectsOverlap(myBox, otherBox);
    }
    
    /**
     * Render lemming
     */
    render(ctx) {
        if (!this.active) return;
        
        // Draw lemming based on current state and animation frame
        this.game.assets.drawAnimationFrame(
            ctx,
            this.x,
            this.y,
            this.state,
            this.animFrame,
            this.direction
        );
        
        // Draw countdown for exploding lemmings
        if (this.state === 'exploding' && this.animFrame < 4) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.fillText(
                Math.ceil(this.countdownTimer).toString(),
                this.x + this.width/2 - 3,
                this.y - 5
            );
        }
    }
}
