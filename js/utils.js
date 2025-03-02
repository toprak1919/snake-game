/**
 * Utility functions for the Snake game
 */
const Utils = {
    /**
     * Converts grid coordinates to canvas pixel coordinates
     * @param {number} x - x coordinate in grid
     * @param {number} y - y coordinate in grid
     * @returns {Object} - {x, y} in canvas pixels
     */
    gridToPixel(x, y) {
        return {
            x: x * Config.GRID_SIZE,
            y: y * Config.GRID_SIZE
        };
    },
    
    /**
     * Generates a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer
     */
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Generates a random position on the grid
     * @returns {Object} - {x, y} coordinates
     */
    getRandomGridPosition() {
        const gridWidth = Math.floor(Config.CANVAS_WIDTH / Config.GRID_SIZE);
        const gridHeight = Math.floor(Config.CANVAS_HEIGHT / Config.GRID_SIZE);
        
        return {
            x: this.getRandomInt(0, gridWidth - 1),
            y: this.getRandomInt(0, gridHeight - 1)
        };
    },
    
    /**
     * Checks if two positions are equal
     * @param {Object} pos1 - First position {x, y}
     * @param {Object} pos2 - Second position {x, y}
     * @returns {boolean} - True if positions are equal
     */
    positionsEqual(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
};