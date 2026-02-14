/**
 * Terrain system for the Lemmings game
 * Handles terrain rendering, collision detection and modification
 * Uses cached collision data for O(1) point queries
 */
// Terrain colours are handled by assets.js drawTerrain()

export class Terrain {
    constructor(game, width, height) {
        this.game = game;
        this.width = width;
        this.height = height;

        // Offscreen canvas for terrain modification (compositing ops)
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        // Cached collision data — avoids per-pixel getImageData calls
        this._collisionData = null;
        this._collisionDirty = true;

        // Visual terrain segments for rendering
        this.terrainSegments = [];
        this.entry = null;
        this.exit = null;

        this.clear();
    }

    /* ── Collision data cache ─────────────────────────────── */

    /** Sync the cached ImageData from the offscreen canvas */
    _syncCollision() {
        this._collisionData = this.ctx.getImageData(0, 0, this.width, this.height);
        this._collisionDirty = false;
    }

    /** Mark collision cache as stale (call after any terrain modification) */
    _invalidateCollision() {
        this._collisionDirty = true;
    }

    /* ── Basic operations ─────────────────────────────────── */

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.terrainSegments = [];
        this.entry = null;
        this.exit = null;
        this._invalidateCollision();
    }

    /** Add a rectangular terrain segment */
    addRect(x, y, w, h, type = 'dirt') {
        x = Math.round(x);
        y = Math.round(y);
        w = Math.round(w);
        h = Math.round(h);
        this.terrainSegments.push({ type, x, y, width: w, height: h });
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x, y, w, h);
        this._invalidateCollision();
    }

    setEntry(x, y) { this.entry = { x: Math.round(x), y: Math.round(y) }; }
    setExit(x, y)  { this.exit  = { x: Math.round(x), y: Math.round(y) }; }

    /* ── Collision queries (use cached data) ───────────────── */

    /** Point collision — O(1) array lookup */
    checkCollision(x, y) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return false;
        if (this._collisionDirty) this._syncCollision();
        return this._collisionData.data[(iy * this.width + ix) * 4 + 3] > 0;
    }

    /** Rectangle collision — checks edges and center */
    checkRectCollision(x, y, w, h) {
        return this.checkCollision(x, y) ||
               this.checkCollision(x + w, y) ||
               this.checkCollision(x, y + h) ||
               this.checkCollision(x + w, y + h) ||
               this.checkCollision(x + w / 2, y + h / 2);
    }

    /** Find the nearest solid pixel below (x, y) within maxDistance.
     *  Returns the y just above the solid pixel, or null. */
    findFloorBelow(x, y, maxDistance = 6) {
        if (this._collisionDirty) this._syncCollision();
        const ix = Math.floor(x);
        const startY = Math.floor(y);
        const endY = Math.min(startY + maxDistance, this.height - 1);
        const data = this._collisionData.data;
        const w = this.width;
        for (let iy = startY; iy <= endY; iy++) {
            // Check center pixel and ±1 for narrow bridges
            for (let dx = -1; dx <= 1; dx++) {
                const cx = ix + dx;
                if (cx < 0 || cx >= w) continue;
                if (data[(iy * w + cx) * 4 + 3] > 0) {
                    return iy - 1;
                }
            }
        }
        return null;
    }

    /** Check whether a point is within the exit zone */
    checkExit(x, y) {
        if (!this.exit) return false;
        return x >= this.exit.x + 6 && x <= this.exit.x + 26 &&
               y >= this.exit.y - 4 && y <= this.exit.y + 20;
    }

    /* ── Terrain modification ─────────────────────────────── */

    /** Dig a circular hole */
    digCircle(x, y, radius) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        this._invalidateCollision();
    }

    /** Bash a horizontal rectangle in front of a lemming */
    bashHorizontal(x, y, width, height) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillRect(x, y - height / 2, width, height);
        this.ctx.restore();
        this._invalidateCollision();
    }

    /** Mine a diagonal area */
    mineDiagonal(x, y, width, height, direction) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        if (direction > 0) {
            this.ctx.moveTo(x, y - height / 2);
            this.ctx.lineTo(x + width, y + height / 2);
            this.ctx.lineTo(x + width, y - height / 2);
        } else {
            this.ctx.moveTo(x, y - height / 2);
            this.ctx.lineTo(x - width, y + height / 2);
            this.ctx.lineTo(x - width, y - height / 2);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        this._invalidateCollision();
    }

    /** Add a bridge step (builder ability) */
    addBridge(x, y, width, height) {
        this.addRect(x, y, width, height, 'bridge');
    }

    /* ── Rendering ────────────────────────────────────────── */

    render(ctx) {
        // Draw terrain segments
        for (const seg of this.terrainSegments) {
            this.game.assets.drawTerrain(ctx, seg.x, seg.y, seg.width, seg.height, seg.type);
        }
        // Entry & exit
        if (this.entry) this.game.assets.drawEntry(ctx, this.entry.x, this.entry.y);
        if (this.exit)  this.game.assets.drawExit(ctx, this.exit.x, this.exit.y);
    }

    /** Debug overlay showing the collision canvas */
    debugRender(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(this.canvas, 0, 0);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px monospace';
        ctx.fillText('Debug: collision overlay (press D to toggle)', 10, this.game.height - 10);
    }
}
