/**
 * Utility functions and constants for the Lemmings game
 * Colors match the classic Amiga Lemmings aesthetic
 */

// Physics constants
const PHYSICS = {
    GRAVITY: 0.15,
    MAX_FALL_SPEED: 4,
    WALK_SPEED: 0.8,
    CLIMB_SPEED: 0.8,
    FLOAT_SPEED: 0.8,
    FALL_DEATH_DISTANCE: 100,   // pixels (at 2x scale) before lethal fall
    BUILDER_STEPS: 12,
    BOMBER_COUNTDOWN: 5,        // seconds
    DIG_RADIUS: 6,
    BASH_WIDTH: 6,
    BASH_HEIGHT: 14,
    MINE_WIDTH: 10,
    MINE_HEIGHT: 8,
    FLOOR_SEARCH_DISTANCE: 6,
    STEP_UP_HEIGHT: 6,          // max height a walker can step up
};

// Color palette — faithful to original Amiga Lemmings
const COLORS = {
    BACKGROUND: '#000033',
    BACKGROUND_GRADIENT: {
        TOP: '#000033',
        BOTTOM: '#000066'
    },
    TERRAIN: {
        DIRT: '#8B5E3C',
        DIRT_DARK: '#6B3F1C',
        GRASS: '#4CAF50',
        GRASS_TIP: '#66CC66',
        ROCK: '#707070',
        ROCK_LIGHT: '#909090',
        BRIDGE: '#C0A060',
        ENTRY: '#5588BB',
        ENTRY_DOOR: '#1A1A40',
        EXIT: '#44AA44',
        EXIT_GLOW: '#88FF88'
    },
    LEMMING: {
        BODY: '#00CC00',        // Classic green body
        HAIR: '#00AAFF',        // Blue hair
        OUTFIT: '#00CC00',      // Green outfit
        SKIN: '#FFD0A0'         // Skin tone for face
    },
    UI: {
        PANEL_BG: '#2A1A4A',
        PANEL_BORDER: '#5544AA',
        TEXT: '#CCFFCC',
        HIGHLIGHT: '#FFFF00'
    }
};

export { COLORS, PHYSICS, clamp, rectsOverlap, formatTime, getRandomInt, Easing };

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Check if two rectangles overlap
 */
function rectsOverlap(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Format time in mm:ss format
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get random integer between min (inclusive) and max (exclusive)
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Easing functions
 */
const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};
