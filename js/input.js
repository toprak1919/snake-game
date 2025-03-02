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
    currentDirection: { x: 1, y: 0 }, // Start moving right
    
    // Next direction
    nextDirection: { x: 1, y: 0 },
    
    // Flag to prevent reversing directly into self
    directionChanged: false,
    
    // Button elements
    startButton: null,
    selectButton: null,
    dpadUp: null,
    dpadDown: null,
    dpadLeft: null,
    dpadRight: null,
    aButton: null,
    bButton: null,
    
    // Callback functions
    onStartGame: null,
    onPauseGame: null,
    onSelectButton: null,
    onAButton: null,
    onBButton: null,
    
    // Key state tracking for Konami code
    pressedKeys: [],
    
    /**
     * Initialize the input handler
     * @param {Object} callbacks - Callback functions for buttons
     */
    init(callbacks) {
        // Store callbacks
        this.onStartGame = callbacks.onStart || null;
        this.onPauseGame = callbacks.onPause || null;
        this.onSelectButton = callbacks.onSelect || null;
        this.onAButton = callbacks.onA || null;
        this.onBButton = callbacks.onB || null;
        
        // Set initial direction
        this.currentDirection = this.DIRECTION.RIGHT;
        this.nextDirection = this.DIRECTION.RIGHT;
        
        // Set up keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Get button references
        this.startButton = document.getElementById('start-button');
        this.selectButton = document.getElementById('select-button');
        this.dpadUp = document.getElementById('dpad-up');
        this.dpadDown = document.getElementById('dpad-down');
        this.dpadLeft = document.getElementById('dpad-left');
        this.dpadRight = document.getElementById('dpad-right');
        this.aButton = document.getElementById('a-button');
        this.bButton = document.getElementById('b-button');
        
        // Set up button click handlers
        this.setupButtonHandlers();
        
        console.log("Input handler initialized");
    },
    
    /**
     * Set up click handlers for all buttons
     */
    setupButtonHandlers() {
        // D-pad buttons
        this.setupDpadButton(this.dpadUp, this.DIRECTION.UP, this.DIRECTION.DOWN);
        this.setupDpadButton(this.dpadDown, this.DIRECTION.DOWN, this.DIRECTION.UP);
        this.setupDpadButton(this.dpadLeft, this.DIRECTION.LEFT, this.DIRECTION.RIGHT);
        this.setupDpadButton(this.dpadRight, this.DIRECTION.RIGHT, this.DIRECTION.LEFT);
        
        // Action buttons
        this.setupActionButton(this.aButton, () => {
            if (this.onAButton) this.onAButton();
        });
        
        this.setupActionButton(this.bButton, () => {
            if (this.onBButton) this.onBButton();
        });
        
        // Menu buttons
        this.setupActionButton(this.startButton, () => {
            if (this.onStartGame) this.onStartGame();
        });
        
        this.setupActionButton(this.selectButton, () => {
            if (this.onSelectButton) this.onSelectButton();
        });
    },
    
    /**
     * Set up a D-pad button with click and touch handlers
     * @param {HTMLElement} button - Button element
     * @param {Object} direction - Direction to set when pressed
     * @param {Object} oppositeDirection - Direction that would cause self-collision
     */
    setupDpadButton(button, direction, oppositeDirection) {
        if (!button) return;
        
        const handleDpadPress = () => {
            // Add active-button class for visual feedback
            button.classList.add('active-button');
            
            // Only change direction if it wouldn't cause immediate self-collision
            if (this.currentDirection.x !== oppositeDirection.x || 
                this.currentDirection.y !== oppositeDirection.y) {
                this.nextDirection = direction;
                console.log(`Direction set to: ${JSON.stringify(direction)}`);
            }
            
            // Remove active class after a short delay
            setTimeout(() => {
                button.classList.remove('active-button');
            }, 150);
        };
        
        // Mouse events
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleDpadPress();
        });
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDpadPress();
        });
    },
    
    /**
     * Set up an action button with click and touch handlers
     * @param {HTMLElement} button - Button element
     * @param {Function} callback - Function to call when pressed
     */
    setupActionButton(button, callback) {
        if (!button || !callback) return;
        
        const handleButtonPress = () => {
            // Add active-button class for visual feedback
            button.classList.add('active-button');
            
            // Call the callback
            callback();
            
            // Remove active class after a short delay
            setTimeout(() => {
                button.classList.remove('active-button');
            }, 150);
        };
        
        // Mouse events
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleButtonPress();
        });
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleButtonPress();
        });
    },
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Track keys for Konami code
        this.pressedKeys.push(key);
        if (this.pressedKeys.length > 10) {
            this.pressedKeys.shift();
        }
        
        // Check for Konami code
        this.checkKonamiCode();
        
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.currentDirection.y !== 1) { // Not going down
                    this.nextDirection = this.DIRECTION.UP;
                    console.log("UP key pressed");
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.currentDirection.y !== -1) { // Not going up
                    this.nextDirection = this.DIRECTION.DOWN;
                    console.log("DOWN key pressed");
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.currentDirection.x !== 1) { // Not going right
                    this.nextDirection = this.DIRECTION.LEFT;
                    console.log("LEFT key pressed");
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.currentDirection.x !== -1) { // Not going left
                    this.nextDirection = this.DIRECTION.RIGHT;
                    console.log("RIGHT key pressed");
                }
                break;
            case 'enter':
                if (this.onStartGame) this.onStartGame();
                break;
            case 'escape':
            case 'p':
                if (this.onPauseGame) this.onPauseGame();
                break;
            case ' ':
                if (this.onAButton) this.onAButton();
                break;
            case 'shift':
                if (this.onBButton) this.onBButton();
                break;
            case 'tab':
                if (this.onSelectButton) {
                    event.preventDefault(); // Prevent tab from changing focus
                    this.onSelectButton();
                }
                break;
        }
    },
    
    /**
     * Check if Konami code sequence has been entered
     * @returns {boolean} - True if Konami code detected
     */
    checkKonamiCode() {
        if (this.pressedKeys.length < 10) return false;
        
        const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
        
        for (let i = 0; i < 10; i++) {
            if (this.pressedKeys[i] !== konamiCode[i]) {
                return false;
            }
        }
        
        // Clear the pressed keys array
        this.pressedKeys = [];
        
        // Konami code activated!
        if (window.Game && typeof window.Game.activateKonamiCode === 'function') {
            window.Game.activateKonamiCode();
        }
        
        return true;
    },
    
    /**
     * Get the current direction
     * @returns {Object} - Current direction {x, y}
     */
    getDirection() {
        // Store whether direction changed
        this.directionChanged = (this.currentDirection.x !== this.nextDirection.x || 
                               this.currentDirection.y !== this.nextDirection.y);
        
        // Update current direction
        this.currentDirection = { ...this.nextDirection };
        
        return this.currentDirection;
    },
    
    /**
     * Reset the direction to right
     */
    reset() {
        this.currentDirection = { ...this.DIRECTION.RIGHT };
        this.nextDirection = { ...this.DIRECTION.RIGHT };
        this.directionChanged = false;
        this.pressedKeys = [];
    }
};