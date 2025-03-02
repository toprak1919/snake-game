/**
 * Manages power-ups in the Snake game
 */
const PowerUpManager = {
    // Current power-up
    active: false,
    position: { x: 0, y: 0 },
    type: null,
    
    // Power-up duration
    activeDuration: 0,
    startTime: 0,
    
    // Active effects
    effects: {
        shield: false,
        speedBoost: false,
        slowMode: false
    },
    
    // Effect timers
    effectTimers: {
        shield: 0,
        speedBoost: 0,
        slowMode: 0
    },
    
    // Animation
    animationFrame: 0,
    lastFrameTime: 0,
    
    // Spawn probability
    spawnChance: 0.1, // 10% chance per food eaten
    
    /**
     * Initialize the power-up manager
     */
    init() {
        this.reset();
    },
    
    /**
     * Reset power-up state
     */
    reset() {
        this.active = false;
        this.effects.shield = false;
        this.effects.speedBoost = false;
        this.effects.slowMode = false;
        this.clearAllTimers();
    },
    
    /**
     * Clear all effect timers
     */
    clearAllTimers() {
        for (const key in this.effectTimers) {
            if (this.effectTimers[key]) {
                clearTimeout(this.effectTimers[key]);
                this.effectTimers[key] = 0;
            }
        }
    },
    
    /**
     * Update power-up animations and check for expired effects
     */
    update() {
        // Update animation frame
        const now = Date.now();
        if (now - this.lastFrameTime > 150) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.lastFrameTime = now;
        }
        
        // Check if active power-up has expired
        if (this.active && now > this.startTime + this.activeDuration) {
            this.active = false;
        }
        
        // Check if any effects have manually expired
        for (const effect in this.effects) {
            if (this.effects[effect] && this.effectTimers[effect] === 0) {
                this.effects[effect] = false;
            }
        }
    },
    
    /**
     * Try to spawn a power-up
     * @param {Array} snakeBody - Snake body segments to avoid
     * @param {Object} foodPosition - Current food position to avoid
     * @returns {boolean} - Whether a power-up was spawned
     */
    trySpawn(snakeBody, foodPosition) {
        // Only spawn if no active power-up and RNG passes
        if (this.active || Math.random() > this.spawnChance) {
            return false;
        }
        
        // Generate a valid position
        let newPosition;
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 20) {
            newPosition = Utils.getRandomGridPosition();
            validPosition = true;
            attempts++;
            
            // Check for collision with snake
            for (const segment of snakeBody) {
                if (Utils.positionsEqual(newPosition, segment)) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check for collision with food
            if (validPosition && Utils.positionsEqual(newPosition, foodPosition)) {
                validPosition = false;
            }
        }
        
        // If we couldn't find a valid position after max attempts, don't spawn
        if (!validPosition) {
            return false;
        }
        
        // Choose a random power-up type
        const powerUpTypes = Object.keys(Config.POWER_UPS);
        this.type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        // Set power-up data
        this.position = newPosition;
        this.active = true;
        this.activeDuration = 10000; // 10 seconds to collect
        this.startTime = Date.now();
        this.animationFrame = 0;
        
        return true;
    },
    
    /**
     * Collect a power-up
     * @returns {string} - Type of power-up collected
     */
    collect() {
        if (!this.active) return null;
        
        const type = this.type;
        this.active = false;
        
        // Activate effect based on type
        switch (type) {
            case 'SHIELD':
                this.activateShield();
                break;
            case 'SPEED_BOOST':
                this.activateSpeedBoost();
                break;
            case 'SLOW_MODE':
                this.activateSlowMode();
                break;
        }
        
        return type;
    },
    
    /**
     * Activate shield power-up
     */
    activateShield() {
        // Clear any existing shield timer
        if (this.effectTimers.shield) {
            clearTimeout(this.effectTimers.shield);
        }
        
        // Activate shield
        this.effects.shield = true;
        
        // Set timer to deactivate
        const duration = Config.POWER_UPS.SHIELD.duration;
        this.effectTimers.shield = setTimeout(() => {
            this.effects.shield = false;
            this.effectTimers.shield = 0;
        }, duration);
    },
    
    /**
     * Activate speed boost power-up
     */
    activateSpeedBoost() {
        // Clear any existing speed boost timer
        if (this.effectTimers.speedBoost) {
            clearTimeout(this.effectTimers.speedBoost);
        }
        
        // Clear any existing slow mode (they're mutually exclusive)
        if (this.effects.slowMode) {
            clearTimeout(this.effectTimers.slowMode);
            this.effects.slowMode = false;
            this.effectTimers.slowMode = 0;
        }
        
        // Activate speed boost
        this.effects.speedBoost = true;
        
        // Set timer to deactivate
        const duration = Config.POWER_UPS.SPEED_BOOST.duration;
        this.effectTimers.speedBoost = setTimeout(() => {
            this.effects.speedBoost = false;
            this.effectTimers.speedBoost = 0;
        }, duration);
    },
    
    /**
     * Activate slow mode power-up
     */
    activateSlowMode() {
        // Clear any existing slow mode timer
        if (this.effectTimers.slowMode) {
            clearTimeout(this.effectTimers.slowMode);
        }
        
        // Clear any existing speed boost (they're mutually exclusive)
        if (this.effects.speedBoost) {
            clearTimeout(this.effectTimers.speedBoost);
            this.effects.speedBoost = false;
            this.effectTimers.speedBoost = 0;
        }
        
        // Activate slow mode
        this.effects.slowMode = true;
        
        // Set timer to deactivate
        const duration = Config.POWER_UPS.SLOW_MODE.duration;
        this.effectTimers.slowMode = setTimeout(() => {
            this.effects.slowMode = false;
            this.effectTimers.slowMode = 0;
        }, duration);
    },
    
    /**
     * Check if any power-up effect is active
     * @returns {boolean} - True if any effect is active
     */
    hasActiveEffect() {
        return this.effects.shield || this.effects.speedBoost || this.effects.slowMode;
    },
    
    /**
     * Get power-up data including position and type
     * @returns {Object} - Power-up data
     */
    getData() {
        return {
            active: this.active,
            position: this.position,
            type: this.type,
            animationFrame: this.animationFrame,
            effects: { ...this.effects } // Copy of current effects
        };
    }
};