/**
 * Handles all rendering for the Snake Boy game
 */
const Renderer = {
    // Canvas and context
    canvas: null,
    ctx: null,
    
    // Animation frame counter for animated elements
    frameCount: 0,
    
    // Screen effecs
    scanlineOffset: 0,
    
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
        
        // Set up power indicator
        const led = document.querySelector('.led');
        if (led) {
            led.style.backgroundColor = '#4CAF50';
            led.style.boxShadow = '0 0 5px #4CAF50';
        }
        
        // Add 'powered-on' class to gameboy
        const gameboy = document.querySelector('.gameboy');
        if (gameboy) {
            gameboy.classList.add('powered-on');
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
     * Draw the background grid
     */
    drawGrid() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = Config.GRID_COLOR;
        this.ctx.lineWidth = 0.5;
        
        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += Config.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += Config.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    },
    
    /**
     * Draw scanlines effect for retro look
     */
    drawScanlines() {
        if (!this.ctx) return;
        
        // Update scanline position for subtle movement
        this.scanlineOffset = (this.scanlineOffset + 0.5) % 4;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
        for (let y = this.scanlineOffset; y < this.canvas.height; y += 4) {
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
    },
    
    /**
     * Draw the score at the top of the screen
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
     * Draw level indicator
     * @param {number} level - Current level
     * @param {number} pointsToNext - Points needed for next level
     */
    drawLevelIndicator(level, pointsToNext) {
        if (!this.ctx) return;
        
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.fillStyle = Config.TEXT_COLOR;
        this.ctx.textAlign = 'left';
        
        // Draw level in the bottom left
        this.ctx.fillText(`LVL:${level}`, 10, this.canvas.height - 10);
    },
    
    /**
     * Draw the snake with direction-specific head
     * @param {Object} snakeData - Snake data from snake.getData()
     */
    drawSnake(snakeData) {
        if (!this.ctx || !snakeData.body.length) return;
        
        // If snake is blinking and should be invisible in this frame, return
        if (snakeData.blinking && !snakeData.visible) {
            return;
        }
        
        // Draw body segments
        this.ctx.fillStyle = snakeData.color;
        
        for (let i = 1; i < snakeData.body.length; i++) {
            const segment = snakeData.body[i];
            const pixelPos = Utils.gridToPixel(segment.x, segment.y);
            
            this.ctx.fillRect(
                pixelPos.x, 
                pixelPos.y, 
                Config.GRID_SIZE, 
                Config.GRID_SIZE
            );
        }
        
        // Draw the head with a different color and direction indicator
        const head = snakeData.body[0];
        const headPixelPos = Utils.gridToPixel(head.x, head.y);
        
        // Head base
        this.ctx.fillStyle = snakeData.headColor;
        this.ctx.fillRect(
            headPixelPos.x, 
            headPixelPos.y, 
            Config.GRID_SIZE, 
            Config.GRID_SIZE
        );
        
        // Direction indicator (eye)
        this.ctx.fillStyle = Config.BG_COLOR;
        
        // Position eye based on direction
        const eyeSize = 3;
        const eyeOffset = 4;
        
        if (snakeData.direction.x === 1) { // Right
            this.ctx.fillRect(
                headPixelPos.x + Config.GRID_SIZE - eyeOffset, 
                headPixelPos.y + eyeOffset, 
                eyeSize, 
                eyeSize
            );
        } else if (snakeData.direction.x === -1) { // Left
            this.ctx.fillRect(
                headPixelPos.x + eyeOffset - eyeSize, 
                headPixelPos.y + eyeOffset, 
                eyeSize, 
                eyeSize
            );
        } else if (snakeData.direction.y === 1) { // Down
            this.ctx.fillRect(
                headPixelPos.x + eyeOffset, 
                headPixelPos.y + Config.GRID_SIZE - eyeOffset, 
                eyeSize, 
                eyeSize
            );
        } else { // Up
            this.ctx.fillRect(
                headPixelPos.x + eyeOffset, 
                headPixelPos.y + eyeOffset - eyeSize, 
                eyeSize, 
                eyeSize
            );
        }
        
        // Draw shield indicator if snake can pass walls
        if (snakeData.canPassWalls) {
            this.ctx.strokeStyle = Config.BG_COLOR;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                headPixelPos.x + 1, 
                headPixelPos.y + 1, 
                Config.GRID_SIZE - 2, 
                Config.GRID_SIZE - 2
            );
        }
    },
    
    /**
     * Draw different types of food
     * @param {Object} foodData - Food data including position, type, and animation
     */
    drawFood(foodData) {
        if (!this.ctx) return;
        
        const pixelPos = Utils.gridToPixel(foodData.position.x, foodData.position.y);
        
        // Draw different types of food
        switch (foodData.type) {
            case 0: // Regular food (10 points)
                this.ctx.fillStyle = Config.FOOD_COLOR;
                this.ctx.fillRect(
                    pixelPos.x, 
                    pixelPos.y, 
                    Config.GRID_SIZE, 
                    Config.GRID_SIZE
                );
                break;
                
            case 1: // Bonus food (20 points)
                this.ctx.fillStyle = Config.FOOD_COLOR;
                this.ctx.fillRect(
                    pixelPos.x, 
                    pixelPos.y, 
                    Config.GRID_SIZE, 
                    Config.GRID_SIZE
                );
                
                // Add pattern to distinguish from regular food
                this.ctx.fillStyle = Config.BG_COLOR;
                this.ctx.fillRect(
                    pixelPos.x + 4, 
                    pixelPos.y + 4, 
                    Config.GRID_SIZE - 8, 
                    Config.GRID_SIZE - 8
                );
                break;
                
            case 2: // Special food (50 points)
                // Animate special food (blinking)
                const blink = (foodData.animationFrame % 2 === 0);
                
                this.ctx.fillStyle = blink ? Config.FOOD_COLOR : Config.COLORS.DARK;
                this.ctx.fillRect(
                    pixelPos.x, 
                    pixelPos.y, 
                    Config.GRID_SIZE, 
                    Config.GRID_SIZE
                );
                
                // Add cross pattern
                this.ctx.fillStyle = Config.BG_COLOR;
                this.ctx.fillRect(
                    pixelPos.x + 2, 
                    pixelPos.y + (Config.GRID_SIZE / 2) - 1, 
                    Config.GRID_SIZE - 4, 
                    2
                );
                this.ctx.fillRect(
                    pixelPos.x + (Config.GRID_SIZE / 2) - 1, 
                    pixelPos.y + 2, 
                    2, 
                    Config.GRID_SIZE - 4
                );
                break;
        }
    },
    
    /**
     * Draw power-ups
     * @param {Object} powerUpData - Power-up data
     */
    drawPowerUp(powerUpData) {
        if (!this.ctx || !powerUpData.active) return;
        
        const pixelPos = Utils.gridToPixel(powerUpData.position.x, powerUpData.position.y);
        
        // Power-up animation
        const animFrame = powerUpData.animationFrame;
        const pulsate = animFrame % 2 === 0;
        
        // Base shape
        this.ctx.fillStyle = pulsate ? Config.COLORS.DARK : Config.COLORS.DARKEST;
        this.ctx.fillRect(
            pixelPos.x, 
            pixelPos.y, 
            Config.GRID_SIZE, 
            Config.GRID_SIZE
        );
        
        // Draw specific icon based on power-up type
        this.ctx.fillStyle = Config.BG_COLOR;
        
        if (powerUpData.type === 'SHIELD') {
            // Shield icon (border)
            this.ctx.strokeStyle = Config.BG_COLOR;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                pixelPos.x + 3, 
                pixelPos.y + 3, 
                Config.GRID_SIZE - 6, 
                Config.GRID_SIZE - 6
            );
        } else if (powerUpData.type === 'SPEED_BOOST') {
            // Speed boost icon (arrow)
            this.ctx.beginPath();
            this.ctx.moveTo(pixelPos.x + 4, pixelPos.y + Config.GRID_SIZE - 4);
            this.ctx.lineTo(pixelPos.x + Config.GRID_SIZE - 4, pixelPos.y + Config.GRID_SIZE / 2);
            this.ctx.lineTo(pixelPos.x + 4, pixelPos.y + 4);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (powerUpData.type === 'SLOW_MODE') {
            // Slow mode icon (clock)
            this.ctx.beginPath();
            this.ctx.arc(
                pixelPos.x + Config.GRID_SIZE / 2,
                pixelPos.y + Config.GRID_SIZE / 2,
                Config.GRID_SIZE / 3,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
            
            // Clock hands
            this.ctx.beginPath();
            this.ctx.moveTo(pixelPos.x + Config.GRID_SIZE / 2, pixelPos.y + Config.GRID_SIZE / 2);
            this.ctx.lineTo(pixelPos.x + Config.GRID_SIZE / 2, pixelPos.y + Config.GRID_SIZE / 3);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(pixelPos.x + Config.GRID_SIZE / 2, pixelPos.y + Config.GRID_SIZE / 2);
            this.ctx.lineTo(pixelPos.x + Config.GRID_SIZE * 2/3, pixelPos.y + Config.GRID_SIZE / 2);
            this.ctx.stroke();
        }
    },
    
    /**
     * Draw obstacles/walls for maze levels
     * @param {Array} obstacles - Array of obstacle positions
     */
    drawObstacles(obstacles) {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = Config.COLORS.DARKEST;
        
        for (const obstacle of obstacles) {
            const pixelPos = Utils.gridToPixel(obstacle.x, obstacle.y);
            
            this.ctx.fillRect(
                pixelPos.x, 
                pixelPos.y, 
                Config.GRID_SIZE, 
                Config.GRID_SIZE
            );
        }
    },
    
    /**
     * Draw active power-up indicators
     * @param {Object} effects - Active effects from PowerUpManager
     */
    drawActiveEffects(effects) {
        if (!this.ctx) return;
        
        const iconSize = 8;
        const padding = 2;
        let offsetX = 10;
        
        // Draw shield indicator
        if (effects.shield) {
            this.ctx.fillStyle = Config.COLORS.DARK;
            this.ctx.fillRect(offsetX, 34, iconSize + padding * 2, iconSize + padding * 2);
            
            this.ctx.strokeStyle = Config.BG_COLOR;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                offsetX + padding, 
                34 + padding, 
                iconSize, 
                iconSize
            );
            
            offsetX += iconSize + padding * 2 + 4;
        }
        
        // Draw speed boost indicator
        if (effects.speedBoost) {
            this.ctx.fillStyle = Config.COLORS.DARK;
            this.ctx.fillRect(offsetX, 34, iconSize + padding * 2, iconSize + padding * 2);
            
            this.ctx.fillStyle = Config.BG_COLOR;
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + padding + 1, 34 + padding + iconSize - 1);
            this.ctx.lineTo(offsetX + padding + iconSize - 1, 34 + padding + iconSize/2);
            this.ctx.lineTo(offsetX + padding + 1, 34 + padding + 1);
            this.ctx.closePath();
            this.ctx.fill();
            
            offsetX += iconSize + padding * 2 + 4;
        }
        
        // Draw slow mode indicator
        if (effects.slowMode) {
            this.ctx.fillStyle = Config.COLORS.DARK;
            this.ctx.fillRect(offsetX, 34, iconSize + padding * 2, iconSize + padding * 2);
            
            this.ctx.strokeStyle = Config.BG_COLOR;
            this.ctx.beginPath();
            this.ctx.arc(
                offsetX + padding + iconSize/2,
                34 + padding + iconSize/2,
                iconSize/2 - 1,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
            
            offsetX += iconSize + padding * 2 + 4;
        }
    },
    
    /**
     * Draw game mode indicator
     * @param {string} mode - Current game mode
     */
    drawGameMode(mode) {
        if (!this.ctx) return;
        
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.fillStyle = Config.TEXT_COLOR;
        this.ctx.textAlign = 'right';
        
        // Draw mode in the bottom right
        this.ctx.fillText(mode, this.canvas.width - 10, this.canvas.height - 10);
    },
    
    /**
     * Draw level transition animation
     * @param {number} level - New level
     * @param {number} progress - Transition progress (0-1)
     */
    drawLevelTransition(level, progress) {
        if (!this.ctx) return;
        
        // Clear the screen
        this.clear();
        
        // Background animation
        const pulseSize = Math.sin(progress * Math.PI) * 50;
        
        // Draw expanding circle
        this.ctx.fillStyle = Config.COLORS.DARK;
        this.ctx.beginPath();
        this.ctx.arc(
            this.canvas.width / 2,
            this.canvas.height / 2,
            pulseSize + 100 * progress,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw level text with scaling effect
        const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);
        
        this.ctx.fillStyle = Config.BG_COLOR;
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`LEVEL ${level}`, 0, -20);
        
        this.ctx.font = '16px "Press Start 2P", monospace';
        this.ctx.fillText('GET READY!', 0, 20);
        
        this.ctx.restore();
    },
    
    /**
     * Draw game over screen
     * @param {number} score - Final score
     */
    drawGameOver(score) {
        if (!this.ctx) return;
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over text
        this.ctx.fillStyle = Config.BG_COLOR;
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // Score display
        this.ctx.font = '16px "Press Start 2P", monospace';
        this.ctx.fillText(`SCORE: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        // Press start text (blinking)
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.font = '12px "Press Start 2P", monospace';
            this.ctx.fillText('PRESS START', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    },
    
    /**
     * Draw start screen
     */
    drawStartScreen() {
        if (!this.ctx) return;
        
        // Clear the screen
        this.clear();
        
        // Title
        this.ctx.fillStyle = Config.TEXT_COLOR;
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SNAKE BOY', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Draw little snake
        this.drawSnakeLogo(this.canvas.width / 2 - 50, this.canvas.height / 2);
        
        // Press start text (blinking)
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.font = '16px "Press Start 2P", monospace';
            this.ctx.fillText('PRESS START', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
        
        // Instructions
        this.ctx.font = '8px "Press Start 2P", monospace';
        this.ctx.fillText('A: SPEED - B: SHIELD', this.canvas.width / 2, this.canvas.height / 2 + 80);
        
        // Copyright
        this.ctx.textAlign = 'right';
        this.ctx.fillText('© 1989 NINTENDO', this.canvas.width - 10, this.canvas.height - 10);
    },
    
    /**
     * Draw a snake logo for the title screen
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    drawSnakeLogo(x, y) {
        if (!this.ctx) return;
        
        const blockSize = 8;
        const snakeColor = Config.COLORS.DARK;
        const headColor = Config.COLORS.DARKEST;
        const foodColor = Config.COLORS.DARKEST;
        
        // Snake body (S shape)
        const bodySegments = [
            {x: 3, y: 0}, {x: 2, y: 0}, {x: 1, y: 0}, {x: 0, y: 0},
            {x: 0, y: 1}, {x: 0, y: 2},
            {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2},
            {x: 3, y: 3}, {x: 3, y: 4},
            {x: 2, y: 4}, {x: 1, y: 4}, {x: 0, y: 4}
        ];
        
        // Draw body
        this.ctx.fillStyle = snakeColor;
        for (const segment of bodySegments) {
            this.ctx.fillRect(
                x + segment.x * blockSize, 
                y + segment.y * blockSize,
                blockSize, 
                blockSize
            );
        }
        
        // Draw head
        this.ctx.fillStyle = headColor;
        this.ctx.fillRect(
            x + 3 * blockSize, 
            y,
            blockSize, 
            blockSize
        );
        
        // Draw eye
        this.ctx.fillStyle = Config.BG_COLOR;
        this.ctx.fillRect(
            x + 3 * blockSize + 5, 
            y + 3,
            2, 
            2
        );
        
        // Draw food
        this.ctx.fillStyle = foodColor;
        this.ctx.fillRect(
            x + 12 * blockSize, 
            y + 2 * blockSize,
            blockSize, 
            blockSize
        );
    },
    
    /**
     * Draw pause screen
     */
    drawPauseScreen() {
        if (!this.ctx) return;
        
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pause text
        this.ctx.fillStyle = Config.BG_COLOR;
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        // Instructions
        this.ctx.font = '10px "Press Start 2P", monospace';
        this.ctx.fillText('PRESS START TO CONTINUE', this.canvas.width / 2, this.canvas.height / 2 + 40);
    },
    
    /**
     * Render the game state
     * @param {Object} gameState - Current game state
     */
    render(gameState) {
        // Increment frame counter
        this.frameCount++;
        
        // Handle level transition
        if (gameState.levelTransition && gameState.levelTransition.active) {
            this.drawLevelTransition(
                gameState.levelTransition.level,
                gameState.levelTransition.progress
            );
            return;
        }
        
        // Clear the canvas
        this.clear();
        
        // Check game state and render appropriate screen
        switch (gameState.status) {
            case 'start':
                this.drawStartScreen();
                break;
                
            case 'playing':
                // Draw game elements
                if (gameState.gameMode === 'MAZE') {
                    this.drawObstacles(gameState.obstacles);
                }
                
                this.drawFood(gameState.food);
                
                if (gameState.powerUp && gameState.powerUp.active) {
                    this.drawPowerUp(gameState.powerUp);
                }
                
                this.drawSnake(gameState.snake);
                
                // Draw HUD elements
                this.drawScore(gameState.score, gameState.highScore);
                this.drawLevelIndicator(gameState.level, gameState.pointsToNextLevel);
                this.drawGameMode(gameState.gameMode);
                
                if (gameState.powerUp && gameState.powerUp.effects) {
                    this.drawActiveEffects(gameState.powerUp.effects);
                }
                
                // Draw scanlines effect
                this.drawScanlines();
                break;
                
            case 'paused':
                // Draw game elements in background
                if (gameState.gameMode === 'MAZE') {
                    this.drawObstacles(gameState.obstacles);
                }
                
                this.drawFood(gameState.food);
                
                if (gameState.powerUp && gameState.powerUp.active) {
                    this.drawPowerUp(gameState.powerUp);
                }
                
                this.drawSnake(gameState.snake);
                
                // Draw HUD elements
                this.drawScore(gameState.score, gameState.highScore);
                this.drawLevelIndicator(gameState.level, gameState.pointsToNextLevel);
                
                // Draw pause overlay
                this.drawPauseScreen();
                break;
                
            case 'gameover':
                // Draw game elements in background
                if (gameState.gameMode === 'MAZE') {
                    this.drawObstacles(gameState.obstacles);
                }
                
                this.drawFood(gameState.food);
                this.drawSnake(gameState.snake);
                
                // Draw game over overlay
                this.drawGameOver(gameState.score);
                break;
        }
    }
};