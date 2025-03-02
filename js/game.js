/**
 * Main Game module that orchestrates the Snake Boy game
 */
const Game = {
    // Game state
    status: 'start', // 'start', 'playing', 'paused', 'gameover'
    gameMode: 'CLASSIC', // 'CLASSIC', 'TIME_ATTACK', 'MAZE'
    modeIndex: 0,
    speed: Config.INITIAL_SPEED,
    
    // Game mode-specific properties
    timeRemaining: 0, // For TIME_ATTACK mode
    
    // Timers and IDs
    gameLoopId: null,
    animationId: null,
    comboTimer: null,
    frameCount: 0,
    
    // Combo system
    comboMultiplier: 1.0,
    lastFoodTime: 0,
    
    // Konami code state
    konamiActivated: false,
    
    /**
     * Initialize the game and all components
     */
    init() {
        // Set up button callbacks
        const buttonCallbacks = {
            onStart: this.toggleStartPause.bind(this),
            onPause: this.togglePause.bind(this),
            onSelect: this.cycleGameMode.bind(this),
            onA: this.activateSpeedBoost.bind(this),
            onB: this.activateShield.bind(this)
        };
        
        // Initialize all modules
        Renderer.init();
        Snake.init();
        Food.init();
        PowerUpManager.init();
        ScoreManager.init();
        LevelManager.init();
        AudioManager.init();
        InputHandler.init(buttonCallbacks); // Initialize input handler last
        
        // Initial render
        this.render();
        
        // Start animation loop
        this.startAnimationLoop();
        
        // Expose this instance to window for Konami code callback
        window.Game = this;
        
        // Try to play startup sound (will be deferred until user interaction)
        try {
            AudioManager.playStartSound();
        } catch (e) {
            console.log('Audio will be initialized on first interaction');
        }
    },
    
    /**
     * Start the animation loop for continuous rendering
     */
    startAnimationLoop() {
        // Cancel any existing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Animation frame function
        const animate = () => {
            this.frameCount++;
            
            // Update components that need animation regardless of game state
            Food.update();
            PowerUpManager.update();
            Snake.updateBlinking();
            
            // Check if level transition is complete
            if (LevelManager.updateTransition()) {
                // Resume game when transition ends
                this.status = 'playing';
                this.startGameLoop();
            }
            
            // Always render the current state
            this.render();
            
            // Continue the animation loop
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Start the animation loop
        this.animationId = requestAnimationFrame(animate);
    },
    
    /**
     * Toggle between start and pause states
     */
    toggleStartPause() {
        if (this.status === 'start' || this.status === 'gameover') {
            this.startGame();
        } else if (this.status === 'playing') {
            this.pauseGame();
        } else if (this.status === 'paused') {
            this.resumeGame();
        }
    },
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.status === 'playing') {
            this.pauseGame();
        } else if (this.status === 'paused') {
            this.resumeGame();
        }
    },
    
    /**
     * Cycle through available game modes
     */
    cycleGameMode() {
        // Only allow changing game mode from start screen
        if (this.status !== 'start') {
            return;
        }
        
        // Play button sound
        AudioManager.playMoveSound();
        
        // Cycle to next mode
        this.modeIndex = (this.modeIndex + 1) % Config.GAME_MODES.length;
        this.gameMode = Config.GAME_MODES[this.modeIndex].name;
        
        // Update display
        this.render();
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
        this.comboMultiplier = 1.0;
        
        // Set up game mode specific settings
        this.setupGameMode();
        
        // Play start sound safely
        try { AudioManager.playStartSound(); } catch (e) {}
        
        // Start the game loop
        this.startGameLoop();
    },
    
    /**
     * Set up the current game mode
     */
    setupGameMode() {
        switch (this.gameMode) {
            case 'TIME_ATTACK':
                // Start with 30 seconds
                this.timeRemaining = 30;
                break;
                
            case 'MAZE':
                // Generate obstacles based on level
                LevelManager.generateObstacles();
                break;
        }
    },
    
    /**
     * Pause the game
     */
    pauseGame() {
        if (this.status !== 'playing') return;
        
        this.status = 'paused';
        this.stopGameLoop();
        
        // Play pause sound safely
        try { AudioManager.playMoveSound(); } catch (e) {}
    },
    
    /**
     * Resume the game from pause
     */
    resumeGame() {
        if (this.status !== 'paused') return;
        
        this.status = 'playing';
        this.startGameLoop();
        
        // Play resume sound safely
        try { AudioManager.playMoveSound(); } catch (e) {}
    },
    
    /**
     * Reset the game to initial state
     */
    resetGame() {
        // Stop all timers
        this.stopGameLoop();
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
        
        // Reset components
        Snake.reset();
        Food.init();
        PowerUpManager.reset();
        ScoreManager.resetScore();
        LevelManager.reset();
        InputHandler.reset();
        
        // Reset game state
        this.status = 'start';
        this.speed = Config.INITIAL_SPEED;
        this.comboMultiplier = 1.0;
        this.konamiActivated = false;
        
        // Play sound safely
        try { AudioManager.playMoveSound(); } catch (e) {}
    },
    
    /**
     * Handle game over
     */
    gameOver() {
        this.status = 'gameover';
        this.stopGameLoop();
        
        // Reset combo
        this.comboMultiplier = 1.0;
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
        
        // Play game over sound safely
        try { AudioManager.playGameOverSound(); } catch (e) {}
        
        // Make snake blink
        Snake.startBlinking(3000);
    },
    
    /**
     * Start the game loop
     */
    startGameLoop() {
        // Clear any existing game loop
        this.stopGameLoop();
        
        // Start a new game loop with current speed
        this.gameLoopId = setInterval(() => {
            this.update();
        }, this.getEffectiveSpeed());
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
        console.log('Current direction:', direction);
        
        // Update the snake's direction
        Snake.updateDirection(direction);
        
        // Check for food collision before moving
        const foodData = Food.getData();
        const willEatFood = Snake.isHeadAt(foodData.position);
        
        // Move the snake
        const obstacles = this.gameMode === 'MAZE' ? LevelManager.obstacles : [];
        const moveSuccessful = Snake.move(willEatFood, obstacles);
        
        // Get snake position for power-up collection
        const snakeHead = Snake.getHead();
        
        // Check for power-up collection
        if (PowerUpManager.active && Utils.positionsEqual(snakeHead, PowerUpManager.position)) {
            const powerUpType = PowerUpManager.collect();
            
            // Apply power-up effect
            if (powerUpType === 'SHIELD') {
                Snake.applyShield(Config.POWER_UPS.SHIELD.duration);
                try { AudioManager.playPowerUpSound(); } catch (e) {}
            }
            
            // Award bonus points
            ScoreManager.addPoints(20);
        }
        
        // Handle collision
        if (!moveSuccessful && !this.konamiActivated) {
            // Game over if move failed (collision)
            this.gameOver();
            return;
        }
        
        // Handle food consumption
        if (willEatFood) {
            // Play eat sound safely
            try { AudioManager.playEatSound(); } catch (e) {}
            
            // Handle combo system
            this.updateCombo();
            
            // Calculate points with combo multiplier
            const points = Math.round(foodData.value * this.comboMultiplier);
            
            // Add points
            ScoreManager.addPoints(points);
            
            // Check for level up
            if (LevelManager.checkLevelUp(ScoreManager.getScore())) {
                this.levelUp();
            } else {
                // Generate new food
                Food.generateNewFood(Snake.getBody(), LevelManager.level);
                
                // Increase speed slightly
                this.increaseSpeed();
                
                // Try to spawn a power-up
                PowerUpManager.trySpawn(Snake.getBody(), Food.getPosition());
            }
            
            // Add time for TIME_ATTACK mode
            if (this.gameMode === 'TIME_ATTACK') {
                this.timeRemaining += 3;
            }
        }
        
        // Update timer for TIME_ATTACK mode
        if (this.gameMode === 'TIME_ATTACK') {
            this.timeRemaining -= this.speed / 1000;
            
            if (this.timeRemaining <= 0) {
                this.gameOver();
                return;
            }
        }
    },
    
    /**
     * Update combo multiplier when eating food
     */
    updateCombo() {
        const now = Date.now();
        const timeSinceLastFood = now - this.lastFoodTime;
        
        // If eaten within combo time window, increase multiplier
        if (this.lastFoodTime > 0 && timeSinceLastFood < Config.COMBO_TIME) {
            this.comboMultiplier += Config.COMBO_MULTIPLIER;
            
            // Cap multiplier at 5x
            this.comboMultiplier = Math.min(5.0, this.comboMultiplier);
        } else {
            // Reset multiplier if too slow
            this.comboMultiplier = 1.0;
        }
        
        // Update last food time
        this.lastFoodTime = now;
        
        // Clear any existing combo timer
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        // Set timer to reset combo if no food eaten in time
        this.comboTimer = setTimeout(() => {
            this.comboMultiplier = 1.0;
        }, Config.COMBO_TIME);
    },
    
    /**
     * Increase the game speed
     */
    increaseSpeed() {
        this.speed = Math.max(Config.MIN_SPEED, this.speed - Config.SPEED_INCREMENT);
        
        // Restart game loop with new speed
        this.restartGameLoop();
    },
    
    /**
     * Get effective game speed considering power-ups
     * @returns {number} - Effective speed in milliseconds
     */
    getEffectiveSpeed() {
        let effectiveSpeed = this.speed;
        
        // Apply speed boost power-up
        if (PowerUpManager.effects.speedBoost) {
            effectiveSpeed = Math.max(Config.MIN_SPEED, effectiveSpeed * 0.5);
        }
        
        // Apply slow mode power-up
        if (PowerUpManager.effects.slowMode) {
            effectiveSpeed = Math.min(300, effectiveSpeed * 1.5);
        }
        
        return effectiveSpeed;
    },
    
    /**
     * Restart the game loop with updated speed
     */
    restartGameLoop() {
        if (this.status === 'playing') {
            this.stopGameLoop();
            this.startGameLoop();
        }
    },
    
    /**
     * Handle level up
     */
    levelUp() {
        // Stop game loop during transition
        this.stopGameLoop();
        
        // Update level
        const levelData = LevelManager.levelUp();
        
        // Start level transition
        this.status = 'levelup';
        
        // Play level up sound safely
        try { AudioManager.playLevelUpSound(); } catch (e) {}
        
        // Update obstacles for maze mode
        if (this.gameMode === 'MAZE') {
            // Generate new obstacles
            LevelManager.generateObstacles();
        }
        
        // Generate new food (avoiding new obstacles)
        Food.generateNewFood(Snake.getBody(), levelData.level);
    },
    
    /**
     * Activate Konami code cheat
     */
    activateKonamiCode() {
        // Only activate if not already active
        if (this.konamiActivated) return;
        
        this.konamiActivated = true;
        
        // Make snake invincible
        Snake.startBlinking(10000);
        
        // Play special sound safely
        try { 
            AudioManager.playPowerUpSound();
            AudioManager.playStartSound();
        } catch (e) {}
        
        // Show message
        alert('Konami Code Activated! Invincibility for 10 seconds!');
        
        // Disable after 10 seconds
        setTimeout(() => {
            this.konamiActivated = false;
        }, 10000);
    },
    
    /**
     * Activate speed boost (A button)
     */
    activateSpeedBoost() {
        if (this.status !== 'playing') return;
        
        // Only if we don't already have an active effect
        if (!PowerUpManager.hasActiveEffect()) {
            PowerUpManager.activateSpeedBoost();
            try { AudioManager.playPowerUpSound(); } catch (e) {}
            
            // Update game speed
            this.restartGameLoop();
        }
    },
    
    /**
     * Activate shield (B button)
     */
    activateShield() {
        if (this.status !== 'playing') return;
        
        // Only if we don't already have an active effect
        if (!PowerUpManager.hasActiveEffect()) {
            PowerUpManager.activateShield();
            Snake.applyShield(Config.POWER_UPS.SHIELD.duration);
            try { AudioManager.playPowerUpSound(); } catch (e) {}
        }
    },
    
    /**
     * Render the current game state
     */
    render() {
        // Build game state for renderer
        const gameState = {
            status: this.status,
            gameMode: this.gameMode,
            snake: Snake.getData(),
            food: Food.getData(),
            powerUp: PowerUpManager.getData(),
            score: ScoreManager.getScore(),
            highScore: ScoreManager.getHighScore(),
            level: LevelManager.level,
            pointsToNextLevel: LevelManager.pointsToNextLevel,
            obstacles: LevelManager.obstacles,
            levelTransition: {
                active: LevelManager.transitioning,
                level: LevelManager.level,
                progress: LevelManager.getTransitionProgress()
            },
            comboMultiplier: this.comboMultiplier,
            timeRemaining: Math.ceil(this.timeRemaining),
            frameCount: this.frameCount
        };
        
        // Render through the renderer
        Renderer.render(gameState);
    }
};

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});