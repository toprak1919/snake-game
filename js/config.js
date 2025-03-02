/**
 * Configuration settings for the Snake Boy game
 */
const Config = {
    // Canvas dimensions
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 360,
    
    // Game grid
    GRID_SIZE: 16, // Size of each grid cell in pixels
    
    // Game speed (milliseconds between updates)
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 3, // How much to decrease the delay after eating food
    MIN_SPEED: 60, // Fastest possible speed
    
    // Colors - using Game Boy palette (4 shades of green)
    COLORS: {
        LIGHTEST: '#9bbc0f', // Lightest Game Boy green
        LIGHT: '#8bac0f',    // Light Game Boy green
        DARK: '#306230',     // Dark Game Boy green
        DARKEST: '#0f380f'   // Darkest Game Boy green
    },
    
    // Game element colors using the palette
    BG_COLOR: '#9bbc0f',         // Lightest green (background)
    GRID_COLOR: '#8bac0f',       // Light green (grid lines)
    SNAKE_COLOR: '#306230',      // Dark green (snake body)
    SNAKE_HEAD_COLOR: '#0f380f', // Darkest green (snake head)
    FOOD_COLOR: '#0f380f',       // Darkest green (food)
    TEXT_COLOR: '#0f380f',       // Darkest green (text)
    
    // Food types
    FOOD_TYPES: [
        { value: 10, probability: 0.7, name: 'regular' },   // Regular food
        { value: 20, probability: 0.2, name: 'bonus' },     // Bonus food
        { value: 50, probability: 0.1, name: 'special' }    // Special food
    ],
    
    // Power-ups
    POWER_UPS: {
        SHIELD: { duration: 5000, name: 'shield' },         // Shield (can pass through walls once)
        SPEED_BOOST: { duration: 3000, name: 'speed' },     // Speed boost
        SLOW_MODE: { duration: 5000, name: 'slow' }         // Slow mode
    },
    
    // Game modes
    GAME_MODES: [
        { name: 'CLASSIC', description: 'Regular snake game' },
        { name: 'TIME ATTACK', description: 'Collect food before time runs out' },
        { name: 'MAZE', description: 'Navigate through obstacles' }
    ],
    
    // Levels
    LEVEL_THRESHOLD: 50,          // Points needed to advance a level
    MAX_LEVEL: 10,                // Maximum game level
    
    // Scoring
    POINTS_PER_FOOD: 10,         // Base points for regular food
    COMBO_MULTIPLIER: 0.5,       // Multiplier increase per quick food collection
    COMBO_TIME: 3000,            // Time window for combo (ms)
    
    // Special abilities
    ABILITIES: {
        SHIELD: { cooldown: 10000, name: 'shield' },
        DASH: { cooldown: 5000, name: 'dash' }
    },
    
    // Local storage keys
    HIGH_SCORE_KEY: 'snakeBoyHighScore',
    SETTINGS_KEY: 'snakeBoySettings',
    
    // Effects
    SCAN_LINES: true,            // Enable scan line effect
    PIXEL_EFFECT: true,          // Enable pixelation effect
    ENABLE_SOUND: true           // Enable sound effects
};