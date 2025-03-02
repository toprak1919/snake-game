/**
 * Handles keyboard and button input for the Snake game
 */
const InputHandler = {
    // Direction constants
    DIRECTION: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    },
    
    // Current direction
    currentDirection: null,
    
    // Direction queue to handle rapid keypresses
    nextDirection: null,
    
    // Flag to prevent reversing directly into self
    directionChanged: false,
    
    // Button elements
    startButton: null,
    resetButton: null,
    dpadUp: null,
    dpadDown: null,
    dpadLeft: null,
    dpadRight: null,
    
    // Callback functions
    onStartGame: null,
    onResetGame: null,
    
    /**
     * Initialize the input handler
     * @param {Function} startCallback - Callback for start button
     * @param {Function} resetCallback - Callback for reset button
     */
    init(startCallback, resetCallback) {
        this.onStartGame = startCallback;
        this.onResetGame = resetCallback;
        
        // Set initial direction
        this.currentDirection = this.DIRECTION.RIGHT;
        this.nextDirection = this.DIRECTION.RIGHT;
        
        // Set up keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Set up button listeners
        this.startButton = document.getElementById('start-button');
        this.resetButton = document.getElementById('reset-button');
        this.dpadUp = document.getElementById('dpad-up');
        this.dpadDown = document.getElementById('dpad-down');
        this.dpadLeft = document.getElementById('dpad-left');
        this.dpadRight = document.getElementById('dpad-right');
        
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                if (this.onStartGame) this.onStartGame();
            });
        }
        
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                if (this.onResetGame) this.onResetGame();
            });
        }
        
        // Set up D-pad button listeners
        if (this.dpadUp) {
            this.dpadUp.addEventListener('click', () => {
                if (this.currentDirection !== this.DIRECTION.DOWN) {
                    this.nextDirection = this.DIRECTION.UP;
                }
            });
        }
        
        if (this.dpadDown) {
            this.dpadDown.addEventListener('click', () => {
                if (this.currentDirection !== this.DIRECTION.UP) {
                    this.nextDirection = this.DIRECTION.DOWN;
                }
            });
        }
        
        if (this.dpadLeft) {
            this.dpadLeft.addEventListener('click', () => {
                if (this.currentDirection !== this.DIRECTION.RIGHT) {
                    this.nextDirection = this.DIRECTION.LEFT;
                }
            });
        }
        
        if (this.dpadRight) {
            this.dpadRight.addEventListener('click', () => {
                if (this.currentDirection !== this.DIRECTION.LEFT) {
                    this.nextDirection = this.DIRECTION.RIGHT;
                }
            });
        }
    },
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.currentDirection !== this.DIRECTION.DOWN) {
                    this.nextDirection = this.DIRECTION.UP;
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.currentDirection !== this.DIRECTION.UP) {
                    this.nextDirection = this.DIRECTION.DOWN;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.currentDirection !== this.DIRECTION.RIGHT) {
                    this.nextDirection = this.DIRECTION.LEFT;
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.currentDirection !== this.DIRECTION.LEFT) {
                    this.nextDirection = this.DIRECTION.RIGHT;
                }
                break;
            case 'enter':
                if (this.onStartGame) this.onStartGame();
                break;
            case 'r':
            case 'backspace':
                if (this.onResetGame) this.onResetGame();
                break;
        }
    },
    
    /**
     * Get the current direction
     * @returns {Object} - Current direction {x, y}
     */
    getDirection() {
        this.directionChanged = (this.currentDirection !== this.nextDirection);
        this.currentDirection = this.nextDirection;
        return this.currentDirection;
    },
    
    /**
     * Reset the direction to right
     */
    reset() {
        this.currentDirection = this.DIRECTION.RIGHT;
        this.nextDirection = this.DIRECTION.RIGHT;
        this.directionChanged = false;
    }
};