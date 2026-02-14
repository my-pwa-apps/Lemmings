/**
 * Lemming entity class
 * Handles individual lemming behavior, states and rendering
 * Gameplay mechanics follow the original Amiga Lemmings rules
 */
import { PHYSICS, rectsOverlap } from './utils.js';

export class Lemming {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 16;   // 8 × 2 (sprite is 8px, drawn at 2× scale)
        this.height = 20;  // 10 × 2

        // Movement
        this.direction = 1;  // 1 = right, −1 = left
        this.fallSpeed = 0;
        this.walkSpeed = PHYSICS.WALK_SPEED;
        this.fallStartY = y;
        this.fallDistance = 0;

        // State machine
        this.state = 'falling';
        this.stateTime = 0;
        this.animFrame = 0;
        this._lastActionFrame = -1; // prevents action firing twice on same frame

        // Persistent abilities (survive state changes)
        this.canClimb = false;
        this.canFloat = false;

        // Builder
        this.bridgeStepsLeft = 0;

        // Bomber
        this.bomberCountdown = 0;
        this.isBomber = false;

        // Status
        this.active = true;
        this.saved = false;
    }

    /* ── State management ─────────────────────────────────── */

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;
        this.stateTime = 0;
        this.animFrame = 0;
        this._lastActionFrame = -1;

        if (newState === 'building') {
            this.bridgeStepsLeft = PHYSICS.BUILDER_STEPS;
        }
    }

    /* ── Ability assignment ────────────────────────────────── */

    grantAbility(ability) {
        switch (ability) {
            case 'climber':
                if (this.canClimb) return false; // already has it
                this.canClimb = true;
                return true;
            case 'floater':
                if (this.canFloat) return false;
                this.canFloat = true;
                return true;
            case 'bomber':
                if (this.isBomber) return false;
                this.isBomber = true;
                this.bomberCountdown = PHYSICS.BOMBER_COUNTDOWN;
                return true;
            case 'blocker':
                if (this.state === 'walking') { this.setState('blocking'); return true; }
                return false;
            case 'digger':
                if (this.state === 'walking') { this.setState('digging'); return true; }
                return false;
            case 'basher':
                if (this.state === 'walking') { this.setState('bashing'); return true; }
                return false;
            case 'miner':
                if (this.state === 'walking') { this.setState('mining'); return true; }
                return false;
            case 'builder':
                if (this.state === 'walking') { this.setState('building'); return true; }
                return false;
            default:
                return false;
        }
    }

    /* ── Main update ──────────────────────────────────────── */

    update(deltaTime) {
        if (!this.active) return;

        // Advance state timer & animation
        this.stateTime += deltaTime;
        const animData = this.game.assets.animations[this.state];
        if (animData) {
            const dur = animData.frameDuration / this.game.gameSpeed;
            this.animFrame = Math.floor(this.stateTime / dur) % animData.frameCount;
        }

        // Bomber countdown (ticks in every state except exiting/exploding)
        if (this.isBomber && this.state !== 'exploding' && this.state !== 'splatting' && this.state !== 'exiting') {
            this.bomberCountdown -= (deltaTime / 1000) * this.game.gameSpeed;
            if (this.bomberCountdown <= 0) {
                this.setState('exploding');
            }
        }

        // State behavior
        switch (this.state) {
            case 'walking':   this.updateWalking(); break;
            case 'falling':   this.updateFalling(); break;
            case 'climbing':  this.updateClimbing(); break;
            case 'floating':  this.updateFloating(); break;
            case 'digging':   this.updateDigging(); break;
            case 'building':  this.updateBuilding(); break;
            case 'blocking':  break; // static — collisions handled by Game
            case 'bashing':   this.updateBashing(); break;
            case 'mining':    this.updateMining(); break;
            case 'exploding': this.updateExploding(deltaTime); break;
            case 'splatting': this.updateSplatting(); break;
            case 'exiting':   this.updateExiting(); break;
        }

        // Check exit (unless already exiting or dead)
        if (this.state !== 'exiting' && this.state !== 'exploding' && this.state !== 'splatting') {
            if (this.game.terrain.checkExit(this.x + this.width / 2, this.y + this.height / 2)) {
                this.setState('exiting');
            }
        }

        // Off-screen death
        if (this.y > this.game.height + 20) {
            this.active = false;
        }
    }

    /* ── Walking ──────────────────────────────────────────── */

    updateWalking() {
        const speed = this.walkSpeed * this.game.gameSpeed;
        this.x += this.direction * speed;

        const terrain = this.game.terrain;
        const frontX = this.x + (this.direction > 0 ? this.width : 0);

        // Wall check at mid-body height
        if (terrain.checkCollision(frontX, this.y + this.height * 0.4)) {
            // Try stepping up (original game lets walkers climb small steps)
            let stepped = false;
            for (let dy = 1; dy <= PHYSICS.STEP_UP_HEIGHT; dy++) {
                if (!terrain.checkCollision(frontX, this.y + this.height * 0.4 - dy)) {
                    this.y -= dy;
                    stepped = true;
                    break;
                }
            }
            if (!stepped) {
                if (this.canClimb) {
                    this.setState('climbing');
                } else {
                    this.direction *= -1;
                }
                return;
            }
        }

        // Floor check
        const floorY = terrain.findFloorBelow(this.x + this.width / 2, this.y + this.height, PHYSICS.FLOOR_SEARCH_DISTANCE);
        if (floorY === null) {
            this.fallStartY = this.y;
            this.fallSpeed = 0;
            this.setState('falling');
        } else {
            this.y = floorY - this.height + 1;
        }
    }

    /* ── Falling ──────────────────────────────────────────── */

    updateFalling() {
        // Gravity
        this.fallSpeed = Math.min(PHYSICS.MAX_FALL_SPEED, this.fallSpeed + PHYSICS.GRAVITY * this.game.gameSpeed);

        // Engage floater if available
        if (this.canFloat && this.fallSpeed > PHYSICS.FLOAT_SPEED) {
            this.fallSpeed = PHYSICS.FLOAT_SPEED;
            this.setState('floating');
            return;
        }

        this.y += this.fallSpeed * this.game.gameSpeed;
        this.fallDistance = this.y - this.fallStartY;

        // Landing check
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width / 2, this.y + this.height, 3);
        if (floorY !== null) {
            this.y = floorY - this.height + 1;

            if (this.fallDistance > PHYSICS.FALL_DEATH_DISTANCE && !this.canFloat) {
                this.game.sound.playSound('splat', 0.5);
                this.setState('splatting');
            } else {
                this.fallSpeed = 0;
                this.fallDistance = 0;
                this.setState('walking');
            }
        }
    }

    /* ── Floating (umbrella) ──────────────────────────────── */

    updateFloating() {
        this.y += PHYSICS.FLOAT_SPEED * this.game.gameSpeed;

        const floorY = this.game.terrain.findFloorBelow(this.x + this.width / 2, this.y + this.height, 3);
        if (floorY !== null) {
            this.y = floorY - this.height + 1;
            this.fallSpeed = 0;
            this.fallDistance = 0;
            this.setState('walking');
        }
    }

    /* ── Climbing ─────────────────────────────────────────── */

    updateClimbing() {
        this.y -= PHYSICS.CLIMB_SPEED * this.game.gameSpeed;

        const wallX = this.x + (this.direction > 0 ? this.width - 1 : 1);

        // Still a wall to hold on to?
        if (!this.game.terrain.checkCollision(wallX, this.y + this.height * 0.5)) {
            // Reached the top — step onto ledge
            this.x += this.direction * 4;
            this.setState('walking');
            return;
        }

        // Ceiling above?
        if (this.game.terrain.checkCollision(this.x + this.width / 2, this.y)) {
            this.direction *= -1;
            this.fallStartY = this.y;
            this.fallSpeed = 0;
            this.setState('falling');
        }
    }

    /* ── Digging ──────────────────────────────────────────── */

    updateDigging() {
        // Fire once per animation cycle at the "dig" frame
        if (this.animFrame === 3 && this._lastActionFrame !== this.animFrame) {
            this._lastActionFrame = this.animFrame;
            this.game.terrain.digCircle(
                this.x + this.width / 2,
                this.y + this.height,
                PHYSICS.DIG_RADIUS
            );
            this.game.sound.playSound('dig', 0.3);
            this.y += 2 * this.game.gameSpeed;
        }
        if (this.animFrame !== 3) this._lastActionFrame = -1;

        // Fell through?
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width / 2, this.y + this.height, 3);
        if (floorY === null) {
            this.fallStartY = this.y;
            this.fallSpeed = 0;
            this.setState('falling');
        }
    }

    /* ── Building ─────────────────────────────────────────── */

    updateBuilding() {
        // Place a step on the action frame (frame 2)
        if (this.animFrame === 2 && this._lastActionFrame !== this.animFrame) {
            this._lastActionFrame = this.animFrame;

            const stepX = this.x + (this.direction > 0 ? this.width : -6);
            const stepY = this.y + this.height - 2;

            this.game.terrain.addBridge(stepX, stepY, 8, 2);
            this.game.sound.playSound('build', 0.3);

            // Step up and forward
            this.x += this.direction * 3 * this.game.gameSpeed;
            this.y -= 2 * this.game.gameSpeed;

            this.bridgeStepsLeft--;

            if (this.bridgeStepsLeft <= 0) {
                this.setState('walking');
                return;
            }

            // Hit a wall?
            if (this.game.terrain.checkCollision(
                this.x + (this.direction > 0 ? this.width : 0),
                this.y + this.height / 2
            )) {
                this.direction *= -1;
                this.setState('walking');
            }
        }
        if (this.animFrame !== 2) this._lastActionFrame = -1;
    }

    /* ── Bashing ──────────────────────────────────────────── */

    updateBashing() {
        if (this.animFrame === 3 && this._lastActionFrame !== this.animFrame) {
            this._lastActionFrame = this.animFrame;
            this.game.terrain.bashHorizontal(
                this.x + (this.direction > 0 ? this.width : -PHYSICS.BASH_WIDTH),
                this.y + this.height / 2,
                PHYSICS.BASH_WIDTH,
                PHYSICS.BASH_HEIGHT
            );
            this.game.sound.playSound('dig', 0.3);
            this.x += this.direction * 2 * this.game.gameSpeed;
        }
        if (this.animFrame !== 3) this._lastActionFrame = -1;

        // No more terrain ahead?
        if (!this.game.terrain.checkCollision(
            this.x + (this.direction > 0 ? this.width + 2 : -2),
            this.y + this.height / 2
        )) {
            this.setState('walking');
        }

        // Floor check
        const floorY = this.game.terrain.findFloorBelow(this.x + this.width / 2, this.y + this.height, PHYSICS.FLOOR_SEARCH_DISTANCE);
        if (floorY === null) {
            this.fallStartY = this.y;
            this.fallSpeed = 0;
            this.setState('falling');
        } else {
            this.y = floorY - this.height + 1;
        }
    }

    /* ── Mining ───────────────────────────────────────────── */

    updateMining() {
        if (this.animFrame === 5 && this._lastActionFrame !== this.animFrame) {
            this._lastActionFrame = this.animFrame;
            this.game.terrain.mineDiagonal(
                this.x + (this.direction > 0 ? this.width : 0),
                this.y + this.height / 2,
                PHYSICS.MINE_WIDTH,
                PHYSICS.MINE_HEIGHT,
                this.direction
            );
            this.game.sound.playSound('dig', 0.3);
            this.x += this.direction * 2 * this.game.gameSpeed;
            this.y += 2 * this.game.gameSpeed;
        }
        if (this.animFrame !== 5) this._lastActionFrame = -1;

        // No terrain below-ahead?
        if (!this.game.terrain.checkCollision(
            this.x + (this.direction > 0 ? this.width + 1 : -1),
            this.y + this.height - 2
        )) {
            this.fallStartY = this.y;
            this.fallSpeed = 0;
            this.setState('falling');
        }
    }

    /* ── Exploding (bomber) ───────────────────────────────── */

    updateExploding(deltaTime) {
        // First phase: blinking "Oh No!" (frames 0-7)
        if (this.animFrame < 8) {
            // Wait for explosion frames to be reached by animation
        } else if (this.animFrame >= 12 && this._lastActionFrame !== 12) {
            // Explode: destroy terrain
            this._lastActionFrame = 12;
            this.game.terrain.digCircle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width
            );
            this.game.sound.playSound('explosion', 0.6);
            this.active = false;
        }
    }

    /* ── Splatting (fall death) ────────────────────────────── */

    updateSplatting() {
        // Brief death animation then remove
        if (this.stateTime > 600) {
            this.active = false;
        }
    }

    /* ── Exiting ──────────────────────────────────────────── */

    updateExiting() {
        if (this.animFrame === 0 && this.stateTime < 50) {
            this.game.sound.playSound('exit', 0.5);
        }
        if (this.animFrame >= 9) {
            this.active = false;
            this.saved = true;
            this.game.lemmingSaved();
        }
    }

    /* ── Blocker collision ────────────────────────────────── */

    checkCollisionWithLemming(other) {
        if (!other.active || other.state !== 'blocking') return false;
        return rectsOverlap(
            { x: this.x, y: this.y, width: this.width, height: this.height },
            { x: other.x, y: other.y, width: other.width, height: other.height }
        );
    }

    /* ── Rendering ────────────────────────────────────────── */

    render(ctx) {
        if (!this.active) return;

        // Draw the animated sprite
        this.game.assets.drawAnimationFrame(ctx, this.x, this.y, this.state, this.animFrame, this.direction);

        // Bomber countdown number
        if (this.isBomber && this.state !== 'exploding' && this.state !== 'splatting') {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                Math.ceil(this.bomberCountdown).toString(),
                this.x + this.width / 2,
                this.y - 4
            );
            ctx.textAlign = 'left';
        }

        // "Oh No!" text during explosion countdown
        if (this.state === 'exploding' && this.animFrame < 8) {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Oh No!', this.x + this.width / 2, this.y - 4);
            ctx.textAlign = 'left';
        }
    }
}
