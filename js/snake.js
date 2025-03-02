/**
 * Snake class that manages the snake's state and behavior
 */
const Snake = {
    // Snake body segments, starting with the head at index 0
    body: [],
    
    // Starting position
    initialPosition: { x: 5, y: 5 },
    
    // Starting length
    initialLength: 3,
    
    /**
     * Initialize the snake to its starting state
     */
    init() {
        this.reset();
    },
    
    /**
     * Reset the snake to its initial state
     */
    reset() {
        this.body = [];
        
        // Create initial snake body horizontally to the left of the initial position
        for (let i = 0; i < this.initialLength; i++) {
            this.body.push({
                x: this.initialPosition.x - i,
                y: this.initialPosition.y
            });
        }
    },
    
    /**
     * Move the snake in the specified direction
     * @param {Object} direction - Direction to move {x, y}
     * @param {boolean} grow - Whether the snake should grow
     * @returns {boolean} - Whether the move was successful (no collision)
     */
    move(direction, grow = false) {
        // Calculate new head position
        const head = this.body[0];
        const newHead = {
            x: head.x + direction.x,
            y: head.y + direction.y
        };
        
        // Check for collisions with walls
        const gridWidth = Math.floor(Config.CANVAS_WIDTH / Config.GRID_SIZE);
        const gridHeight = Math.floor(Config.CANVAS_HEIGHT / Config.GRID_SIZE);
        
        if (newHead.x < 0 || newHead.x >= gridWidth || 
            newHead.y < 0 || newHead.y >= gridHeight) {
            return false; // Collision with wall
        }
        
        // Check for collisions with self (except last segment which will move)
        const checkBody = grow ? this.body : this.body.slice(0, -1);
        for (const segment of checkBody) {
            if (Utils.positionsEqual(newHead, segment)) {
                return false; // Collision with self
            }
        }
        
        // Add new head
        this.body.unshift(newHead);
        
        // Remove tail if not growing
        if (!grow) {
            this.body.pop();
        }
        
        return true; // Move successful
    },
    
    /**
     * Check if the snake's head is at the specified position
     * @param {Object} position - Position to check {x, y}
     * @returns {boolean} - True if the head is at the position
     */
    isHeadAt(position) {
        return this.body.length > 0 && Utils.positionsEqual(this.body[0], position);
    },
    
    /**
     * Get the snake's body segments
     * @returns {Array} - Array of body positions
     */
    getBody() {
        return this.body;
    },
    
    /**
     * Get the snake's head position
     * @returns {Object} - Head position {x, y}
     */
    getHead() {
        return this.body[0];
    },
    
    /**
     * Get the length of the snake
     * @returns {number} - Snake length
     */
    getLength() {
        return this.body.length;
    }
};