import { LevelManager } from './levels.js';
import { Assets } from './assets.js';
import { COLORS, PHYSICS, formatTime } from './utils.js';
import { Terrain } from './terrain.js';
import { SoundManager } from './sound.js';
import { Lemming } from './lemming.js';

/**
 * Main game class for the Lemmings game
 */
export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Fixed internal resolution (original Lemmings was 320×160, we use 2×)
        this.width = 960;
        this.height = 540;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game state
        this.gameSpeed = 1;
        this.isPaused = false;
        this.debugMode = false;
        this.isLevelActive = false;
        this._levelEnded = false; // guard against double endLevel

        // Time tracking
        this.lastTime = 0;
        this.timeRemaining = 0;

        // Mouse (in canvas-space)
        this.mouseX = 0;
        this.mouseY = 0;
        this.selectedAbility = null;

        // Lemming management
        this.lemmings = [];
        this.lemmingCount = 0;
        this.lemmingTotal = 0;
        this.savedCount = 0;
        this.requiredSaveCount = 0;
        this.releaseRate = 1;
        this.releaseTimer = 0;
        this.remainingLemmings = 0;

        // Level management
        this.currentLevel = null;

        // Components (initialised in init)
        this.assets = null;
        this.terrain = null;
        this.levelManager = null;
        this.sound = null;

        this.init();
    }

    /* ── Initialisation ───────────────────────────────────── */

    init() {
        this.assets = new Assets(this);
        this.terrain = new Terrain(this, this.width, this.height);
        this.levelManager = new LevelManager(this);
        this.sound = new SoundManager();
        this.setupEventListeners();
        this.showLevelSelection();

        // Start the render/game loop once
        this.lastTime = performance.now();
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    /* ── Event listeners ──────────────────────────────────── */

    setupEventListeners() {
        // ─ Mouse → canvas-space conversion ─
        const toCanvas = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
                y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
            };
        };

        this.canvas.addEventListener('mousemove', (e) => {
            const p = toCanvas(e);
            this.mouseX = p.x;
            this.mouseY = p.y;
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.isLevelActive || this.isPaused) return;
            const p = toCanvas(e);
            this.handleCanvasClick(p.x, p.y);
        });

        // Ability buttons
        document.querySelectorAll('.ability-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectAbility(btn.id.replace('ability-', ''));
            });
        });

        // Speed controls
        document.getElementById('speed-decrease').addEventListener('click', () => {
            this.gameSpeed = Math.max(0.5, this.gameSpeed - 0.5);
            document.getElementById('current-speed').textContent = this.gameSpeed + 'x';
        });
        document.getElementById('speed-increase').addEventListener('click', () => {
            this.gameSpeed = Math.min(3, this.gameSpeed + 0.5);
            document.getElementById('current-speed').textContent = this.gameSpeed + 'x';
        });

        // Pause
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        // Level-complete modal buttons
        document.getElementById('next-level-btn').addEventListener('click', () => {
            document.getElementById('level-complete').classList.remove('active');
            this.startLevel(this.currentLevel.id + 1);
        });
        document.getElementById('retry-level-btn').addEventListener('click', () => {
            document.getElementById('level-complete').classList.remove('active');
            this.startLevel(this.currentLevel.id);
        });
        document.getElementById('level-select-btn').addEventListener('click', () => {
            document.getElementById('level-complete').classList.remove('active');
            this.showLevelSelection();
        });

        // Nuke button
        const nukeBtn = document.getElementById('nuke-btn');
        if (nukeBtn) {
            nukeBtn.addEventListener('click', () => {
                if (!this.isLevelActive) return;
                if (confirm('Nuke all lemmings?')) {
                    this.lemmings.forEach(l => {
                        if (l.active && l.state !== 'exploding' && l.state !== 'splatting' && l.state !== 'exiting') {
                            l.isBomber = true;
                            l.bomberCountdown = Math.random() * 2; // stagger
                        }
                    });
                }
            });
        }

        // Resize
        window.addEventListener('resize', () => this.onResize());
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    /* ── Canvas click ─────────────────────────────────────── */

    handleCanvasClick(x, y) {
        if (!this.selectedAbility) return;

        // Find closest lemming under cursor
        const clicked = this.lemmings.find(l => {
            if (!l.active) return false;
            return x >= l.x && x <= l.x + l.width &&
                   y >= l.y && y <= l.y + l.height;
        });

        if (clicked) {
            const abilities = this.currentLevel.abilities;
            if (abilities[this.selectedAbility] > 0) {
                if (clicked.grantAbility(this.selectedAbility)) {
                    abilities[this.selectedAbility]--;
                    this.sound.playSound('pop', 0.3);
                    this.updateAbilityUI();
                }
            }
        }
    }

    /* ── Ability selection ─────────────────────────────────── */

    selectAbility(ability) {
        document.querySelectorAll('.ability-btn').forEach(b => b.classList.remove('active'));
        if (this.selectedAbility !== ability) {
            this.selectedAbility = ability;
            document.getElementById('ability-' + ability).classList.add('active');
            this.sound.playSound('pop', 0.2);
        } else {
            this.selectedAbility = null;
        }
    }

    /* ── Level selection ──────────────────────────────────── */

    showLevelSelection() {
        this.isLevelActive = false;
        this.lemmings = [];
        this.sound.stopBackgroundMusic();

        const levelSelect = document.getElementById('level-select');
        levelSelect.classList.add('active');

        const container = document.querySelector('.levels-container');
        container.innerHTML = '';

        this.levelManager.getAllLevels().forEach(level => {
            const btn = document.createElement('button');
            btn.classList.add('level-btn');
            btn.innerHTML = `<strong>Level ${level.id}</strong><br><span style="font-size:0.85em">${level.name}</span>`;
            btn.addEventListener('click', () => {
                this.startLevel(level.id);
                levelSelect.classList.remove('active');
            });
            container.appendChild(btn);
        });
    }

    /* ── Start level ──────────────────────────────────────── */

    startLevel(levelId) {
        if (!this.levelManager.loadLevel(levelId)) return;

        this.currentLevel = this.levelManager.getCurrentLevel();
        this.lemmingTotal = this.currentLevel.lemmingCount;
        this.remainingLemmings = this.lemmingTotal;
        this.releaseRate = this.currentLevel.releaseRate;
        this.timeRemaining = this.currentLevel.timeLimit;
        this.requiredSaveCount = this.currentLevel.requiredSaveCount;

        this.lemmingCount = 0;
        this.savedCount = 0;
        this.releaseTimer = 0;
        this.lemmings = [];
        this._levelEnded = false;

        this.updateCountsUI();
        this.updateAbilityUI();

        this.isLevelActive = true;
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = 'Pause';

        this.sound.playBackgroundMusic('gameplay', true);
    }

    /* ── Game loop ────────────────────────────────────────── */

    gameLoop(timestamp) {
        const deltaTime = Math.min(timestamp - this.lastTime, 50); // cap at 50ms
        this.lastTime = timestamp;

        if (this.isLevelActive && !this.isPaused) {
            this.update(deltaTime);
        }
        this.render();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    /* ── Update ───────────────────────────────────────────── */

    update(deltaTime) {
        // Time
        this.timeRemaining -= (deltaTime / 1000) * this.gameSpeed;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.endLevel(this.savedCount >= this.requiredSaveCount);
            return;
        }

        // Release lemmings
        this.updateLemmingRelease(deltaTime);

        // Update lemmings
        for (const lemming of this.lemmings) {
            lemming.update(deltaTime);
        }

        // Blocker collisions
        this.handleBlockerCollisions();

        // UI
        this.updateCountsUI();

        // Check end conditions: all lemmings accounted for
        const activeLemmings = this.lemmings.filter(l => l.active).length;
        if (activeLemmings === 0 && this.remainingLemmings === 0) {
            this.endLevel(this.savedCount >= this.requiredSaveCount);
        }
    }

    updateLemmingRelease(deltaTime) {
        if (this.remainingLemmings <= 0) return;
        this.releaseTimer += (deltaTime / 1000) * this.gameSpeed;
        const interval = 1 / this.releaseRate;
        if (this.releaseTimer >= interval) {
            this.releaseTimer -= interval;
            this.releaseLemming();
        }
    }

    releaseLemming() {
        if (!this.terrain.entry || this.remainingLemmings <= 0) return;
        const lemming = new Lemming(
            this,
            this.terrain.entry.x + 8,
            this.terrain.entry.y + 16
        );
        this.lemmings.push(lemming);
        this.lemmingCount++;
        this.remainingLemmings--;
    }

    handleBlockerCollisions() {
        const blockers = this.lemmings.filter(l => l.active && l.state === 'blocking');
        if (blockers.length === 0) return;
        for (const lemming of this.lemmings) {
            if (!lemming.active || lemming.state === 'blocking') continue;
            for (const blocker of blockers) {
                if (lemming.checkCollisionWithLemming(blocker)) {
                    lemming.direction *= -1;
                    break;
                }
            }
        }
    }

    lemmingSaved() {
        this.savedCount++;
    }

    /* ── End level ────────────────────────────────────────── */

    endLevel(isWin) {
        if (this._levelEnded) return; // prevent double-fire
        this._levelEnded = true;
        this.isLevelActive = false;

        // Play result sound
        this.sound.stopBackgroundMusic();
        this.sound.playSound(isWin ? 'success' : 'fail', 0.6);

        // Update modal
        document.getElementById('level-result-title').textContent =
            isWin ? 'Level Complete!' : 'Level Failed';

        const msg = isWin
            ? `You saved ${this.savedCount} out of ${this.lemmingTotal} lemmings!`
            : `You saved ${this.savedCount}/${this.lemmingTotal}. Needed: ${this.requiredSaveCount}.`;
        document.getElementById('level-result-message').textContent = msg;

        // Next level button visibility
        const hasNext = this.levelManager.levels.some(l => l.id === this.currentLevel.id + 1);
        document.getElementById('next-level-btn').style.display =
            (isWin && hasNext) ? 'inline-block' : 'none';

        document.getElementById('level-complete').classList.add('active');
    }

    /* ── UI updates ───────────────────────────────────────── */

    updateCountsUI() {
        document.getElementById('lemming-count').textContent = this.lemmingCount;
        document.getElementById('lemming-total').textContent = this.lemmingTotal;
        document.getElementById('saved-count').textContent = this.savedCount;
        document.getElementById('time-remaining').textContent = formatTime(Math.max(0, this.timeRemaining));
    }

    updateAbilityUI() {
        if (!this.currentLevel) return;
        const abilities = this.currentLevel.abilities;
        for (const ability of Object.keys(abilities)) {
            const btn = document.getElementById('ability-' + ability);
            if (!btn) continue;
            const count = abilities[ability];
            btn.textContent = ability.charAt(0).toUpperCase() + ability.slice(1) + ` (${count})`;
            if (count <= 0) {
                btn.classList.add('disabled');
                if (this.selectedAbility === ability) { this.selectedAbility = null; }
                btn.classList.remove('active');
            } else {
                btn.classList.remove('disabled');
            }
        }
    }

    /* ── Render ────────────────────────────────────────────── */

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Background gradient (classic dark-blue sky)
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, COLORS.BACKGROUND_GRADIENT.TOP);
        grad.addColorStop(1, COLORS.BACKGROUND_GRADIENT.BOTTOM);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Terrain
        this.terrain.render(ctx);

        // Debug overlay
        if (this.debugMode) {
            this.terrain.debugRender(ctx);
        }

        // Lemmings
        for (const lemming of this.lemmings) {
            lemming.render(ctx);
            if (this.debugMode) {
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 1;
                ctx.strokeRect(lemming.x, lemming.y, lemming.width, lemming.height);
            }
        }

        // Selection cursor
        if (this.selectedAbility && this.isLevelActive && !this.isPaused) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.mouseX, this.mouseY, 14, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '11px monospace';
            ctx.fillText(this.selectedAbility, this.mouseX + 16, this.mouseY - 4);
        }

        // Debug HUD
        if (this.debugMode) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(8, 8, 180, 50);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '11px monospace';
            ctx.fillText(`Active: ${this.lemmings.filter(l => l.active).length}`, 14, 22);
            ctx.fillText(`Mouse: ${Math.round(this.mouseX)}, ${Math.round(this.mouseY)}`, 14, 36);
            ctx.fillText(`Speed: ${this.gameSpeed}x`, 14, 50);
        }
    }

    /* ── Resize (CSS only — internal resolution stays fixed) ── */

    onResize() {
        // Canvas resolution stays constant; CSS handles scaling.
        // Nothing to do here since we use `width: 100%` in CSS.
    }
}
