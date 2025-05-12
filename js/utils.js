/**
 * Utility functions for the Lemmings game
 */

// Color palette for the game
const COLORS = {
    BACKGROUND: '#000000',
    BACKGROUND_GRADIENT: {
        TOP: '#000022',
        BOTTOM: '#003366'
    },
    TERRAIN: {
        DIRT: '#8B4513',
        ROCK: '#696969',
        ENTRY: '#4682B4',
        EXIT: '#32CD32'
    },
    LEMMING: {
        BODY: '#00BFFF',
        HAIR: '#FFD700',
        OUTFIT: '#1E90FF'
    }
};

export { COLORS };

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
    // Linear interpolation
    linear: (t) => t,
    
    // Quadratic easing
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Bounce effect
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
};
