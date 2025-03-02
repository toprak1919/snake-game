/**
 * Main Game module that orchestrates the Snake game
 */
const Game = {
    // Game state
    status: 'start', // 'start', 'playing', 'paused', 'gameover'
    speed: Config.INITIAL_SPEED,
    gameLoopId: null,
    animationId: null,
    
    /**
     * Initialize the game and all components
     */
    init() {
        // Initialize all modules
        Renderer.init();
        InputHandler.init(this.startGame.bind(this), this.resetGame.bind(this));
        Snake.init();
        Food.init();
        ScoreManager.init();
        
        // Initial render
        this.render();
        
        // Start animation loop for menu screens
        this.startAnimationLoop();
    },
    
    /**
     * Start the animation loop for menu screens
     */
    startAnimationLoop() {
        // Cancel any existing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Animation frame function
        const animate = () => {
            // Only render if not in gameplay (for menu screens with blinking text)
            if (this.status !== 'playing') {
                this.render();
            }
            
            // Continue the animation loop
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Start the animation loop
        this.animationId = requestAnimationFrame(animate);
    },
    
    /**
     * Start the game
     */
    startGame() {
        // Don't restart if already playing
        if (this.status === 'playing') return;
        
        // If game over, reset everything first
        if (this.status === 'gameover') {
            this.resetGame();
        }
        
        // Start the game
        this.status = 'playing';
        this.speed = Config.INITIAL_SPEED;
        this.startGameLoop();
    },
    
    /**
     * Reset the game to initial state
     */
    resetGame() {
        // Stop the game loop if running
        this.stopGameLoop();
        
        // Reset components
        Snake.reset();
        Food.generateNewFood(Snake.getBody());
        ScoreManager.resetScore();
        InputHandler.reset();
        
        // Reset game state
        this.status = 'start';
        this.speed = Config.INITIAL_SPEED;
        
        // Render the start screen
        this.render();
    },
    
    /**
     * Game over
     */
    gameOver() {
        this.status = 'gameover';
        this.stopGameLoop();
        this.render();
    },
    
    /**
     * Start the game loop
     */
    startGameLoop() {
        // Clear any existing game loop
        this.stopGameLoop();
        
        // Start a new game loop
        this.gameLoopId = setInterval(() => {
            this.update();
        }, this.speed);
    },
    
    /**
     * Stop the game loop
     */
    stopGameLoop() {
        if (this.gameLoopId !== null) {
            clearInterval(this.gameLoopId);
            this.gameLoopId = null;
        }
    },
    
    /**
     * Update game state for one step
     */
    update() {
        if (this.status !== 'playing') return;
        
        // Get the current direction
        const direction = InputHandler.getDirection();
        
        // Move the snake
        const foodPosition = Food.getPosition();
        const grow = Snake.isHeadAt(foodPosition);
        const moveSuccessful = Snake.move(direction, grow);
        
        if (!moveSuccessful) {
            // Game over if move failed (collision)
            this.gameOver();
            return;
        }
        
        // Handle food consumption
        if (grow) {
            // Generate new food
            Food.generateNewFood(Snake.getBody());
            
            // Add points
            ScoreManager.addPoints(Config.POINTS_PER_FOOD);
            
            // Increase speed
            this.increaseSpeed();
        }
        
        // Render the updated state
        this.render();
    },
    
    /**
     * Increase the game speed
     */
    increaseSpeed() {
        this.speed = Math.max(Config.MIN_SPEED, this.speed - Config.SPEED_INCREMENT);
        
        // Restart game loop with new speed
        this.stopGameLoop();
        this.startGameLoop();
    },
    
    /**
     * Render the current game state
     */
    render() {
        // Build game state for renderer
        const gameState = {
            status: this.status,
            snake: Snake.getBody(),
            food: Food.getPosition(),
            score: ScoreManager.getScore(),
            highScore: ScoreManager.getHighScore()
        };
        
        // Render through the renderer
        Renderer.render(gameState);
    }
};

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});