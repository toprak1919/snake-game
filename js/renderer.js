/**
 * Handles all rendering for the Snake Boy game
 */
const Renderer = {
    // Canvas and context
    canvas: null,
    ctx: null,
    
    /**
     * Initialize the renderer
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            // Set up pixel rendering
            this.ctx.imageSmoothingEnabled = false;
        } else {
            console.error('Canvas element not found');
        }
    },
    
    /**
     * Clear the canvas
     */
    clear() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = Config.BG_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    /**
     * Draw the score at the top of the screen in Game Boy style
     * @param {number} score - Current score
     * @param {number} highScore - High score
     */
    drawScore(score, highScore) {
        if (!this.ctx) return;
        
        this.ctx.font = '16px "Press Start 2P", monospace';
        this.ctx.fillStyle = Config.TEXT_COLOR;
        
        // Draw score on left side
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE:${score}`, 10, 24);
        
        // Draw high score on right side
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`HI:${highScore}`, this.canvas.width - 10, 24);
    },
    
    /**
     * Draw the snake in Game Boy style (pixelated blocks)
     * @param {Array} snakeBody - Array of snake body positions
     */
    drawSnake(snakeBody) {
        if (!this.ctx || !snakeBody.length) return;
        
        // Draw the body
        this.ctx.fillStyle = Config.SNAKE_COLOR;
        for (let i = 1; i < snakeBody.length; i++) {
            const segment = snakeBody[i];
            const pixelPos = Utils.gridToPixel(segment.x, segment.y);
            
            this.ctx.fillRect(
                pixelPos.x, 
                pixelPos.y, 
                Config.GRID_SIZE, 
                Config.GRID_SIZE
            );
        }
        
        // Draw the head with a different color
        this.ctx.fillStyle = Config.SNAKE_HEAD_COLOR;
        const head = snakeBody[0];
        const headPixelPos = Utils.gridToPixel(head.x, head.y);
        
        this.ctx.fillRect(
            headPixelPos.x, 
            headPixelPos.y, 
            Config.GRID_SIZE, 
            Config.GRID_SIZE
        );
    },
    
    /**
     * Draw the food in Game Boy style
     * @param {Object} foodPosition - Food position {x, y}
     */
    drawFood(foodPosition) {
        if (!this.ctx) return;
        
        const pixelPos = Utils.gridToPixel(foodPosition.x, foodPosition.y);
        
        // Draw food as a simple square for Game Boy style
        this.ctx.fillStyle = Config.FOOD_COLOR;
        this.ctx.fillRect(
            pixelPos.x, 
            pixelPos.y, 
            Config.GRID_SIZE, 
            Config.GRID_SIZE
        );
    },
    
    /**
     * Draw pixelated text in Game Boy style
     * @param {string} text - Text to display
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} size - Font size ('small', 'medium', or 'large')
     * @param {string} align - Text alignment ('left', 'center', or 'right')
     */
    drawText(text, x, y, size = 'medium', align = 'center') {
        if (!this.ctx) return;
        
        let fontSize;
        switch (size) {
            case 'small':
                fontSize = 12;
                break;
            case 'large':
                fontSize = 24;
                break;
            default:
                fontSize = 16;
        }
        
        this.ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
        this.ctx.fillStyle = Config.TEXT_COLOR;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    },
    
    /**
     * Draw game over message in Game Boy style
     */
    drawGameOver() {
        if (!this.ctx) return;
        
        // Game Over text
        this.drawText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 15, 'large');
        
        // Blinking "PRESS START" text
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.drawText('PRESS START', this.canvas.width / 2, this.canvas.height / 2 + 30, 'medium');
        }
    },
    
    /**
     * Draw the start screen in Game Boy style
     */
    drawStartScreen() {
        if (!this.ctx) return;
        
        // Title
        this.drawText('SNAKE BOY', this.canvas.width / 2, this.canvas.height / 2 - 30, 'large');
        
        // Blinking "PRESS START" text
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.drawText('PRESS START', this.canvas.width / 2, this.canvas.height / 2 + 30, 'medium');
        }
    },
    
    /**
     * Render the entire game state
     * @param {Object} gameState - Current game state
     */
    render(gameState) {
        this.clear();
        
        if (gameState.status === 'playing') {
            this.drawScore(gameState.score, gameState.highScore);
            this.drawFood(gameState.food);
            this.drawSnake(gameState.snake);
        } else if (gameState.status === 'gameover') {
            this.drawScore(gameState.score, gameState.highScore);
            this.drawFood(gameState.food);
            this.drawSnake(gameState.snake);
            this.drawGameOver();
        } else if (gameState.status === 'start') {
            this.drawStartScreen();
        }
    }
};