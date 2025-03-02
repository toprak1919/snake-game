/**
 * Manages food generation and placement in the Snake game
 */
const Food = {
    // Current food data
    position: { x: 0, y: 0 },
    value: 10,
    type: 0,
    
    // Food animation
    animationFrame: 0,
    lastFrameTime: 0,
    
    /**
     * Initialize the food
     */
    init() {
        this.generateNewFood();
        this.lastFrameTime = Date.now();
    },
    
    /**
     * Update the food animation
     */
    update() {
        const now = Date.now();
        if (now - this.lastFrameTime > 200) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.lastFrameTime = now;
        }
    },
    
    /**
     * Generate new food in a random position
     * @param {Array} snakeBody - Array of snake body positions to avoid
     * @param {number} level - Current game level (affects food probabilities)
     */
    generateNewFood(snakeBody = [], level = 1) {
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
        
        // Determine food type based on probabilities and level
        this.determineFoodType(level);
        
        // Reset animation
        this.animationFrame = 0;
    },
    
    /**
     * Determine the type and value of food to generate
     * @param {number} level - Current game level
     */
    determineFoodType(level) {
        // As level increases, increase chance of better food
        const levelBonus = Math.min(0.3, (level - 1) * 0.03);
        
        // Random number between 0 and 1
        const rand = Math.random();
        
        // Adjust probabilities based on level
        if (rand < Config.FOOD_TYPES[0].probability - levelBonus) {
            // Regular food (10 points)
            this.type = 0;
            this.value = Config.FOOD_TYPES[0].value;
        } else if (rand < Config.FOOD_TYPES[0].probability + Config.FOOD_TYPES[1].probability) {
            // Bonus food (20 points)
            this.type = 1;
            this.value = Config.FOOD_TYPES[1].value;
        } else {
            // Special food (50 points)
            this.type = 2;
            this.value = Config.FOOD_TYPES[2].value;
        }
    },
    
    /**
     * Get the current food data
     * @returns {Object} - Food data including position, value, type, and animation
     */
    getData() {
        return {
            position: this.position,
            value: this.value,
            type: this.type,
            animationFrame: this.animationFrame
        };
    },
    
    /**
     * Get the current food position
     * @returns {Object} - Food position {x, y}
     */
    getPosition() {
        return this.position;
    }
};