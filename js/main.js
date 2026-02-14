import { Game } from './game.js';

/**
 * Main entry point — bootstraps the game and wires up global keyboard shortcuts
 */
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('game-canvas');

    // ── Help modal (not in Game to keep DOM concerns separate) ──
    document.getElementById('help-btn').addEventListener('click', () => {
        document.getElementById('help-modal').classList.add('active');
        game.isPaused = true;
        document.getElementById('pause-btn').textContent = 'Resume';
    });

    document.getElementById('close-help-btn').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
    });

    // ── Sound toggle ──
    document.getElementById('sound-btn').addEventListener('click', () => {
        const btn = document.getElementById('sound-btn');
        const muted = game.sound.toggleMute();
        btn.textContent = muted ? '🔇' : '🔊';
        btn.classList.toggle('muted', muted);
        if (!muted) game.sound.playSound('pop', 0.3);
    });

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case 'd':
                game.debugMode = !game.debugMode;
                break;
            case 'p':
                game.togglePause();
                break;
            case '+': case '=':
                game.gameSpeed = Math.min(3, game.gameSpeed + 0.5);
                document.getElementById('current-speed').textContent = game.gameSpeed + 'x';
                break;
            case '-': case '_':
                game.gameSpeed = Math.max(0.5, game.gameSpeed - 0.5);
                document.getElementById('current-speed').textContent = game.gameSpeed + 'x';
                break;
            case 'm':
                document.getElementById('sound-btn').click();
                break;
            case 'escape':
                if (game.isLevelActive && confirm('Return to level selection?')) {
                    game.showLevelSelection();
                }
                break;
            default:
                // 1–8 → ability selection
                if (e.key >= '1' && e.key <= '8') {
                    const abilities = ['climber','floater','bomber','blocker','builder','basher','miner','digger'];
                    game.selectAbility(abilities[parseInt(e.key) - 1]);
                }
        }
    });
});
