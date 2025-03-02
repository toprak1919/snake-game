/**
 * Manages food generation and placement in the Snake game
 */
const Food = {
    // Current food position
    position: { x: 0, y: 0 },
    
    /**
     * Initialize the food
     */
    init() {
        this.generateNewFood();
    },
    
    /**
     * Generate new food in a random position
     * @param {Array} snakeBody - Array of snake body positions to avoid
     */
    generateNewFood(snakeBody = []) {
        let newPosition;
        let validPosition = false;
        
        // Keep generating positions until we find one not occupied by the snake
        while (!validPosition) {
            newPosition = Utils.getRandomGridPosition();
            validPosition = true;
            
            // Check if the new position overlaps with the snake
            for (const segment of snakeBody) {
                if (Utils.positionsEqual(newPosition, segment)) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        this.position = newPosition;
    },
    
    /**
     * Get the current food position
     * @returns {Object} - Food position {x, y}
     */
    getPosition() {
        return this.position;
    }
};