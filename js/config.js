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
    SPEED_INCREMENT: 5, // How much to decrease the delay after eating food
    MIN_SPEED: 60, // Fastest possible speed
    
    // Colors - using Game Boy palette (4 shades of green)
    BG_COLOR: '#9cb53b', // Lightest green (background)
    SNAKE_COLOR: '#306230', // Dark green (snake body)
    SNAKE_HEAD_COLOR: '#0f380f', // Darkest green (snake head)
    FOOD_COLOR: '#0f380f', // Darkest green (food)
    GRID_COLOR: '#8cac30', // Slightly darker than background
    TEXT_COLOR: '#0f380f', // Darkest green (text)
    
    // Scoring
    POINTS_PER_FOOD: 10,
    
    // Local storage key for high score
    HIGH_SCORE_KEY: 'snakeBoyHighScore'
};