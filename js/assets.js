import { COLORS } from './utils.js';

/**
 * Procedural asset generation for the Lemmings game
 * All sprites, terrain patterns and decorations are generated here
 */
export class Assets {
    constructor(game) {
        this.game = game;
        this.sprites = {};
        this.animations = {};
        this.terrainPatterns = {};
        this.generateAssets();
    }

    /* ── Asset generation ─────────────────────────────────── */

    generateAssets() {
        this.generateLemmingSprites();
        this.generateTerrainPatterns();
    }

    generateLemmingSprites() {
        const states = [
            'walking', 'falling', 'climbing',
            'digging', 'building', 'blocking',
            'bashing', 'mining', 'floating',
            'exploding', 'splatting', 'exiting'
        ];
        for (const state of states) {
            this.generateLemmingAnimation(state);
        }
    }

    generateLemmingAnimation(state) {
        const w = 8, h = 10;
        const frameCount = this.getFrameCount(state);
        const canvas = document.createElement('canvas');
        canvas.width = w * frameCount;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        for (let f = 0; f < frameCount; f++) {
            this.drawLemmingFrame(ctx, f * w, 0, state, f);
        }

        this.sprites[state] = canvas;
        this.animations[state] = {
            frameCount,
            frameWidth: w,
            frameHeight: h,
            frameDuration: this.getFrameDuration(state)
        };
    }

    getFrameCount(state) {
        const counts = {
            walking: 8, falling: 4, climbing: 8,
            digging: 8, building: 16, blocking: 4,
            bashing: 8, mining: 16, floating: 8,
            exploding: 16, splatting: 4, exiting: 16
        };
        return counts[state] || 4;
    }

    getFrameDuration(state) {
        const durations = {
            walking: 100, falling: 100, climbing: 100,
            digging: 120, building: 110, blocking: 200,
            bashing: 110, mining: 110, floating: 120,
            exploding: 180, splatting: 150, exiting: 100
        };
        return durations[state] || 100;
    }

    /* ── Lemming sprite drawing (8×10 pixels) ─────────────── */

    drawLemmingFrame(ctx, x, y, state, f) {
        ctx.clearRect(x, y, 8, 10);
        switch (state) {
            case 'walking':   this.drawWalking(ctx, x, y, f); break;
            case 'falling':   this.drawFalling(ctx, x, y, f); break;
            case 'climbing':  this.drawClimbing(ctx, x, y, f); break;
            case 'digging':   this.drawDigging(ctx, x, y, f); break;
            case 'building':  this.drawBuilding(ctx, x, y, f); break;
            case 'blocking':  this.drawBlocking(ctx, x, y, f); break;
            case 'bashing':   this.drawBashing(ctx, x, y, f); break;
            case 'mining':    this.drawMining(ctx, x, y, f); break;
            case 'floating':  this.drawFloating(ctx, x, y, f); break;
            case 'exploding': this.drawExploding(ctx, x, y, f); break;
            case 'splatting': this.drawSplatting(ctx, x, y, f); break;
            case 'exiting':   this.drawExiting(ctx, x, y, f); break;
            default:
                ctx.fillStyle = COLORS.LEMMING.BODY;
                ctx.fillRect(x + 2, y + 2, 4, 6);
                ctx.fillStyle = COLORS.LEMMING.HAIR;
                ctx.fillRect(x + 2, y, 4, 2);
        }
    }

    // ── Walking ──
    drawWalking(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 3, 4, 5);          // body
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 0, 4, 2);           // hair
        ctx.fillStyle = COLORS.LEMMING.SKIN;
        ctx.fillRect(x + 3, y + 2, 2, 1);            // face

        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const arm = f % 4;
        const armY = arm === 0 ? 4 : arm === 1 ? 3 : arm === 2 ? 4 : 5;
        ctx.fillRect(x + 1, y + armY, 1, 2);
        ctx.fillRect(x + 6, y + armY, 1, 2);

        const leg = f % 4;
        if (leg < 2) {
            ctx.fillRect(x + 2, y + 8, 1, 2);
            ctx.fillRect(x + 5, y + 8, 1, 2);
        } else {
            ctx.fillRect(x + 1, y + 8, 1, 2);
            ctx.fillRect(x + 6, y + 8, 1, 2);
        }
    }

    // ── Falling ──
    drawFalling(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y, 4, 2);

        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const spread = f % 2;
        ctx.fillRect(x + (spread ? 0 : 1), y + 1, 1, 3);
        ctx.fillRect(x + (spread ? 7 : 6), y + 1, 1, 3);
        ctx.fillRect(x + (spread ? 1 : 2), y + 8, 1, 2);
        ctx.fillRect(x + (spread ? 6 : 5), y + 8, 1, 2);
    }

    // ── Climbing ──
    drawClimbing(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 3, y + 2, 4, 6);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 3, y, 4, 2);
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const phase = f % 4;
        ctx.fillRect(x + 1, y + (phase < 2 ? 2 : 4), 2, 1);
        ctx.fillRect(x + 1, y + (phase < 2 ? 5 : 1), 2, 1);
        ctx.fillRect(x + 4, y + (phase % 2 === 0 ? 8 : 9), 2, 1);
        ctx.fillRect(x + 3, y + (phase % 2 === 0 ? 9 : 8), 3, 1);
    }

    // ── Digging ──
    drawDigging(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 5);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y, 4, 2);
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const phase = f % 4;
        const toolY = phase === 0 ? 1 : phase === 1 ? 3 : phase === 2 ? 6 : 3;
        ctx.fillRect(x + 1, y + toolY, 1, 2);
        ctx.fillRect(x + 6, y + toolY, 1, 2);
        ctx.fillRect(x + 2, y + toolY, 4, 1);  // shovel
        ctx.fillRect(x + 2, y + 7, 1, 3);
        ctx.fillRect(x + 5, y + 7, 1, 3);
    }

    // ── Building ──
    drawBuilding(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y, 4, 2);
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const c = f % 8;
        if (c < 3) {
            ctx.fillRect(x + 6, y + 4, 2, 1);  // brick
            ctx.fillRect(x + 5, y + 3, 1, 3);
        } else if (c < 5) {
            ctx.fillRect(x + 6, y + 6, 2, 1);  // placing
            ctx.fillRect(x + 5, y + 4, 1, 2);
        } else {
            ctx.fillRect(x + 1, y + 4, 2, 1);  // fetching
            ctx.fillRect(x + 1, y + 3, 1, 3);
        }
        ctx.fillRect(x + 2, y + 8, 1, 2);
        ctx.fillRect(x + 5, y + 8, 1, 2);
    }

    // ── Blocking ──
    drawBlocking(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y, 4, 2);
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const dy = f % 2;
        ctx.fillRect(x + 0, y + 3 + dy, 2, 1);  // left arm out
        ctx.fillRect(x + 6, y + 3 + dy, 2, 1);  // right arm out
        ctx.fillRect(x + 1, y + 8, 2, 2);        // wide leg
        ctx.fillRect(x + 5, y + 8, 2, 2);
    }

    // ── Bashing ──
    drawBashing(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 2, 4, 6);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y, 4, 2);
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const c = f % 4;
        if (c === 0) {
            ctx.fillRect(x, y + 2, 1, 4);     // tool back
        } else if (c === 1 || c === 3) {
            ctx.fillRect(x + 3, y + 2, 2, 1); // mid-swing
        } else {
            ctx.fillRect(x + 6, y + 2, 1, 4); // tool forward hit
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 7, y + 3, 1, 1); // impact spark
        }
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        ctx.fillRect(x + 2, y + 8, 1, 2);
        ctx.fillRect(x + 5, y + 8, 1, 2);
    }

    // ── Mining ──
    drawMining(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 3, y + 2, 4, 5);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 3, y, 4, 2);
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const c = f % 8;
        if (c < 2) {
            ctx.fillRect(x + 2, y + 1, 3, 1); // pickaxe high
            ctx.fillRect(x + 3, y + 0, 1, 2);
        } else if (c < 4) {
            ctx.fillRect(x + 2, y + 3, 3, 1); // mid
        } else if (c < 6) {
            ctx.fillRect(x + 2, y + 6, 3, 1); // hitting ground
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x + 2, y + 7, 1, 1);
            ctx.fillRect(x + 4, y + 7, 1, 1);
        } else {
            ctx.fillRect(x + 2, y + 3, 3, 1); // returning
        }
        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        ctx.fillRect(x + 3, y + 7, 1, 3);
        ctx.fillRect(x + 6, y + 7, 1, 3);
    }

    // ── Floating (umbrella) ──
    drawFloating(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(x + 2, y + 4, 4, 4);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        ctx.fillRect(x + 2, y + 2, 4, 2);

        // Umbrella
        ctx.fillStyle = '#FF6688';
        ctx.fillRect(x + 0, y - 2, 8, 1);
        ctx.fillRect(x + 1, y - 1, 6, 1);
        // Handle
        ctx.fillStyle = '#AA8866';
        ctx.fillRect(x + 4, y + 0, 1, 3);

        ctx.fillStyle = COLORS.LEMMING.OUTFIT;
        const swing = f % 4 < 2;
        ctx.fillRect(x + (swing ? 2 : 3), y + 8, 1, 2);
        ctx.fillRect(x + (swing ? 5 : 4), y + 8, 1, 2);
    }

    // ── Exploding ──
    drawExploding(ctx, x, y, f) {
        if (f < 8) {
            // Blinking countdown phase
            const flash = f % 2 === 0;
            ctx.fillStyle = flash ? COLORS.LEMMING.BODY : '#FFFFFF';
            ctx.fillRect(x + 2, y + 2, 4, 6);
            ctx.fillStyle = flash ? COLORS.LEMMING.HAIR : '#FFAAAA';
            ctx.fillRect(x + 2, y, 4, 2);
            ctx.fillStyle = flash ? COLORS.LEMMING.OUTFIT : '#FFFFFF';
            ctx.fillRect(x + 1, y + 3, 1, 2);
            ctx.fillRect(x + 6, y + 3, 1, 2);
            ctx.fillRect(x + 2, y + 8, 1, 2);
            ctx.fillRect(x + 5, y + 8, 1, 2);
        } else {
            // Explosion
            const size = (f - 8) * 1.5 + 1;
            const colors = ['#FFFF00', '#FF8800', '#FF0000', '#FFFFFF'];
            ctx.fillStyle = colors[(f - 8) % colors.length];
            ctx.beginPath();
            ctx.arc(x + 4, y + 5, size, 0, Math.PI * 2);
            ctx.fill();
            // Particles
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + f * 0.5;
                const d = size * 0.8;
                ctx.fillRect(x + 4 + Math.cos(a) * d, y + 5 + Math.sin(a) * d, 1, 1);
            }
        }
    }

    // ── Splatting (splat death) ──
    drawSplatting(ctx, x, y, f) {
        ctx.fillStyle = COLORS.LEMMING.BODY;
        // Flatten the lemming over frames
        const squish = Math.min(f + 1, 4);
        const w = 4 + squish;
        const h = Math.max(1, 6 - squish);
        ctx.fillRect(x + 4 - w / 2, y + 10 - h, w, h);
        // Splash marks
        if (f >= 2) {
            ctx.fillStyle = COLORS.LEMMING.OUTFIT;
            ctx.fillRect(x + 0, y + 9, 1, 1);
            ctx.fillRect(x + 7, y + 9, 1, 1);
            ctx.fillRect(x + 1, y + 8, 1, 1);
            ctx.fillRect(x + 6, y + 8, 1, 1);
        }
    }

    // ── Exiting ──
    drawExiting(ctx, x, y, f) {
        const shrink = 1 - f / 16;
        if (shrink <= 0) return;
        const cx = x + 4, cy = y + 5;
        const w = 4 * shrink, h = 8 * shrink;
        ctx.fillStyle = COLORS.LEMMING.BODY;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.fillStyle = COLORS.LEMMING.HAIR;
        const hh = 2 * shrink;
        ctx.fillRect(cx - w / 2, cy - h / 2 - hh, w, hh);
        if (shrink > 0.3) {
            ctx.fillStyle = COLORS.LEMMING.OUTFIT;
            const ls = Math.max(0.5, shrink);
            ctx.fillRect(cx - w / 2 - ls, cy - h / 4, ls, h / 3);
            ctx.fillRect(cx + w / 2, cy - h / 4, ls, h / 3);
        }
    }

    /* ── Terrain patterns ─────────────────────────────────── */

    generateTerrainPatterns() {
        this.terrainPatterns.dirt = this.makeDirtPattern();
        this.terrainPatterns.rock = this.makeRockPattern();
        this.terrainPatterns.bridge = this.makeBridgePattern();
    }

    makeDirtPattern() {
        const c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        const ctx = c.getContext('2d');
        ctx.fillStyle = COLORS.TERRAIN.DIRT;
        ctx.fillRect(0, 0, 16, 16);
        // Noise
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (Math.random() < 0.25) {
                    ctx.fillStyle = COLORS.TERRAIN.DIRT_DARK;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        return c;
    }

    makeRockPattern() {
        const c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        const ctx = c.getContext('2d');
        ctx.fillStyle = COLORS.TERRAIN.ROCK;
        ctx.fillRect(0, 0, 16, 16);
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (Math.random() < 0.35) {
                    ctx.fillStyle = COLORS.TERRAIN.ROCK_LIGHT;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        return c;
    }

    makeBridgePattern() {
        const c = document.createElement('canvas');
        c.width = 8; c.height = 4;
        const ctx = c.getContext('2d');
        ctx.fillStyle = COLORS.TERRAIN.BRIDGE;
        ctx.fillRect(0, 0, 8, 4);
        ctx.fillStyle = '#A08040';
        ctx.fillRect(0, 0, 8, 1);
        return c;
    }

    /* ── Drawing helpers ──────────────────────────────────── */

    drawTerrain(ctx, x, y, width, height, type = 'dirt') {
        const pat = this.terrainPatterns[type];
        if (pat) {
            const p = ctx.createPattern(pat, 'repeat');
            ctx.fillStyle = p;
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.fillStyle = COLORS.TERRAIN.DIRT;
            ctx.fillRect(x, y, width, height);
        }

        // Grass on top of dirt
        if (type === 'dirt' && height > 4) {
            ctx.fillStyle = COLORS.TERRAIN.GRASS;
            ctx.fillRect(x, y, width, 3);
            // Grass tips
            ctx.fillStyle = COLORS.TERRAIN.GRASS_TIP;
            for (let gx = x; gx < x + width; gx += 3) {
                const tipH = 1 + (gx * 7 % 3);  // pseudo-random
                ctx.fillRect(gx, y - tipH, 2, tipH);
            }
        }
    }

    drawEntry(ctx, x, y) {
        // Trapdoor hatch
        ctx.fillStyle = COLORS.TERRAIN.ENTRY;
        ctx.fillRect(x, y, 26, 22);
        // Opening (dark)
        ctx.fillStyle = COLORS.TERRAIN.ENTRY_DOOR;
        ctx.fillRect(x + 3, y + 12, 20, 10);
        // Hatch details — metallic strips
        ctx.fillStyle = '#88AACC';
        ctx.fillRect(x + 2, y + 2, 22, 2);
        ctx.fillRect(x + 2, y + 7, 22, 2);
        // Arrow indicator
        ctx.fillStyle = '#FFFF66';
        ctx.fillRect(x + 11, y + 14, 4, 4);
        ctx.fillRect(x + 9, y + 16, 8, 2);
    }

    drawExit(ctx, x, y) {
        // Base
        ctx.fillStyle = COLORS.TERRAIN.EXIT;
        ctx.fillRect(x, y, 32, 24);
        // Door opening
        ctx.fillStyle = '#003300';
        ctx.fillRect(x + 6, y - 2, 20, 18);
        // Glow animation
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(136, 255, 136, ${pulse * 0.4})`;
        ctx.fillRect(x + 8, y, 16, 14);
        // Frame details
        ctx.fillStyle = COLORS.TERRAIN.EXIT_GLOW;
        ctx.fillRect(x + 4, y + 18, 24, 2);
        ctx.fillRect(x + 4, y + 22, 24, 2);
        // Posts
        ctx.fillStyle = '#228822';
        ctx.fillRect(x + 4, y - 2, 3, 22);
        ctx.fillRect(x + 25, y - 2, 3, 22);
    }

    drawAnimationFrame(ctx, x, y, state, frameIndex, direction = 1) {
        const anim = this.animations[state];
        if (!anim) return;

        const srcX = (frameIndex % anim.frameCount) * anim.frameWidth;
        const scale = 2;

        ctx.save();
        if (direction < 0) {
            ctx.translate(x + anim.frameWidth * scale, 0);
            ctx.scale(-1, 1);
            x = 0;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.sprites[state],
            srcX, 0, anim.frameWidth, anim.frameHeight,
            x, y, anim.frameWidth * scale, anim.frameHeight * scale
        );
        ctx.restore();
    }
}
