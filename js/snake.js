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
    
    // Current direction
    direction: { x: 1, y: 0 },
    
    // Special effects
    blinking: false,
    blinkEndTime: 0,
    
    // Snake color (can change with power-ups)
    color: Config.SNAKE_COLOR,
    headColor: Config.SNAKE_HEAD_COLOR,
    
    // Wall pass ability (from shield power-up)
    canPassWalls: false,
    
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
        this.direction = { x: 1, y: 0 };
        this.blinking = false;
        this.color = Config.SNAKE_COLOR;
        this.headColor = Config.SNAKE_HEAD_COLOR;
        this.canPassWalls = false;
        
        // Create initial snake body horizontally to the left of the initial position
        for (let i = 0; i < this.initialLength; i++) {
            this.body.push({
                x: this.initialPosition.x - i,
                y: this.initialPosition.y
            });
        }
    },
    
    /**
     * Move the snake in the current direction
     * @param {boolean} grow - Whether the snake should grow
     * @param {Array} obstacles - Array of obstacle positions to check
     * @returns {boolean} - Whether the move was successful (false = collision)
     */
    move(grow = false, obstacles = []) {
        // Get current head position
        const head = this.body[0];
        
        // Calculate new head position
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Update snake's direction for next time
        this.direction = { ...this.direction };
        
        // Check for collisions with walls
        const gridWidth = Math.floor(Config.CANVAS_WIDTH / Config.GRID_SIZE);
        const gridHeight = Math.floor(Config.CANVAS_HEIGHT / Config.GRID_SIZE);
        
        let wallCollision = false;
        
        // Wall teleportation (wrap around) if can pass walls
        if (newHead.x < 0 || newHead.x >= gridWidth || 
            newHead.y < 0 || newHead.y >= gridHeight) {
            
            wallCollision = true;
            
            if (this.canPassWalls) {
                // Wrap around
                newHead.x = (newHead.x + gridWidth) % gridWidth;
                newHead.y = (newHead.y + gridHeight) % gridHeight;
                wallCollision = false;
                
                // Use up the wall pass ability
                this.canPassWalls = false;
            }
        }
        
        if (wallCollision) {
            return false; // Collision with wall
        }
        
        // Check for collisions with obstacles
        for (const obstacle of obstacles) {
            if (Utils.positionsEqual(newHead, obstacle)) {
                return false; // Collision with obstacle
            }
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
     * Update the snake's direction
     * @param {Object} direction - New direction {x, y}
     */
    updateDirection(direction) {
        this.direction = { ...direction };
    },
    
    /**
     * Start blinking effect for the snake
     * @param {number} duration - Duration in milliseconds
     */
    startBlinking(duration = 3000) {
        this.blinking = true;
        this.blinkEndTime = Date.now() + duration;
    },
    
    /**
     * Update the snake's blinking state
     */
    updateBlinking() {
        if (this.blinking && Date.now() > this.blinkEndTime) {
            this.blinking = false;
        }
    },
    
    /**
     * Apply shield effect to the snake
     * @param {number} duration - Shield duration in milliseconds
     */
    applyShield(duration = 5000) {
        // Change color to indicate shield
        this.color = '#8bac0f'; // Light green
        this.headColor = '#306230'; // Dark green
        
        // Enable wall passing
        this.canPassWalls = true;
        
        // Start blinking effect
        this.startBlinking(duration);
        
        // Reset after duration
        setTimeout(() => {
            this.color = Config.SNAKE_COLOR;
            this.headColor = Config.SNAKE_HEAD_COLOR;
            this.canPassWalls = false;
            this.blinking = false;
        }, duration);
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
    },
    
    /**
     * Check if the snake should be visible (for blinking effect)
     * @returns {boolean} - Whether snake should be visible
     */
    isVisible() {
        if (!this.blinking) return true;
        
        // Blink every 100ms
        return Math.floor(Date.now() / 100) % 2 === 0;
    },
    
    /**
     * Get the snake's current data
     * @returns {Object} - Snake data for rendering
     */
    getData() {
        return {
            body: this.body,
            direction: this.direction,
            color: this.color,
            headColor: this.headColor,
            blinking: this.blinking,
            visible: this.isVisible(),
            canPassWalls: this.canPassWalls
        };
    }
};