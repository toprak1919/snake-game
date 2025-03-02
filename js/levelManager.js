/**
 * Manages game levels and progression
 */
const LevelManager = {
    // Current level
    level: 1,
    
    // Points needed for next level
    pointsToNextLevel: 0,
    
    // Level transition animation
    transitioning: false,
    transitionStartTime: 0,
    transitionDuration: 1500, // ms
    
    // Level-specific obstacles or walls
    obstacles: [],
    
    /**
     * Initialize the level manager
     */
    init() {
        this.reset();
    },
    
    /**
     * Reset level manager state
     */
    reset() {
        this.level = 1;
        this.pointsToNextLevel = Config.LEVEL_THRESHOLD;
        this.transitioning = false;
        this.obstacles = [];
    },
    
    /**
     * Check if player should level up based on score
     * @param {number} score - Current score
     * @returns {boolean} - True if level up should occur
     */
    checkLevelUp(score) {
        if (score >= this.pointsToNextLevel && this.level < Config.MAX_LEVEL) {
            return true;
        }
        return false;
    },
    
    /**
     * Perform level up
     * @returns {Object} - Level up information
     */
    levelUp() {
        if (this.level >= Config.MAX_LEVEL) {
            return null;
        }
        
        this.level++;
        this.pointsToNextLevel += Config.LEVEL_THRESHOLD * this.level;
        
        // Start transition animation
        this.transitioning = true;
        this.transitionStartTime = Date.now();
        
        // Generate level-specific obstacles for maze mode (level 3+)
        if (this.level >= 3) {
            this.generateObstacles();
        }
        
        return {
            level: this.level,
            pointsToNextLevel: this.pointsToNextLevel
        };
    },
    
    /**
     * Generate obstacles based on current level
     */
    generateObstacles() {
        this.obstacles = [];
        
        // Only generate obstacles in maze mode
        if (Game.gameMode !== 'MAZE') {
            return;
        }
        
        const gridWidth = Math.floor(Config.CANVAS_WIDTH / Config.GRID_SIZE);
        const gridHeight = Math.floor(Config.CANVAS_HEIGHT / Config.GRID_SIZE);
        
        // Number of obstacles increases with level
        const obstacleCount = Math.min(10, this.level * 2);
        
        for (let i = 0; i < obstacleCount; i++) {
            // Generate wall segments
            const wallLength = Math.min(6, 2 + Math.floor(this.level / 2));
            const horizontal = Math.random() > 0.5;
            
            // Random starting position (avoiding edges)
            const startX = Utils.getRandomInt(2, gridWidth - wallLength - 2);
            const startY = Utils.getRandomInt(2, gridHeight - wallLength - 2);
            
            // Generate wall segments
            for (let j = 0; j < wallLength; j++) {
                this.obstacles.push({
                    x: horizontal ? startX + j : startX,
                    y: horizontal ? startY : startY + j
                });
            }
        }
    },
    
    /**
     * Check if position collides with any obstacle
     * @param {Object} position - Position to check {x, y}
     * @returns {boolean} - True if collision with obstacle
     */
    checkObstacleCollision(position) {
        for (const obstacle of this.obstacles) {
            if (Utils.positionsEqual(position, obstacle)) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * Update level transition animation
     * @returns {boolean} - True if transition animation is complete
     */
    updateTransition() {
        if (!this.transitioning) {
            return false;
        }
        
        const elapsed = Date.now() - this.transitionStartTime;
        if (elapsed >= this.transitionDuration) {
            this.transitioning = false;
            return true;
        }
        
        return false;
    },
    
    /**
     * Get transition progress (0 to 1)
     * @returns {number} - Transition progress
     */
    getTransitionProgress() {
        if (!this.transitioning) {
            return 1;
        }
        
        const elapsed = Date.now() - this.transitionStartTime;
        return Math.min(1, elapsed / this.transitionDuration);
    },
    
    /**
     * Get current level data
     * @returns {Object} - Level data
     */
    getLevelData() {
        return {
            level: this.level,
            pointsToNextLevel: this.pointsToNextLevel,
            transitioning: this.transitioning,
            transitionProgress: this.getTransitionProgress(),
            obstacles: this.obstacles
        };
    }
};