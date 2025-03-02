/**
 * Manages score tracking and display for the Snake game
 */
const ScoreManager = {
    // Current score
    score: 0,
    
    // High score
    highScore: 0,
    
    /**
     * Initialize the score manager
     */
    init() {
        // Load high score from local storage
        this.loadHighScore();
        
        // Initialize score
        this.resetScore();
    },
    
    /**
     * Reset the current score
     */
    resetScore() {
        this.score = 0;
    },
    
    /**
     * Add points to the current score
     * @param {number} points - Points to add
     */
    addPoints(points) {
        this.score += points;
        
        // Update high score if needed
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    },
    
    /**
     * Load the high score from local storage
     */
    loadHighScore() {
        const storedHighScore = localStorage.getItem(Config.HIGH_SCORE_KEY);
        if (storedHighScore !== null) {
            this.highScore = parseInt(storedHighScore, 10);
        } else {
            this.highScore = 0;
        }
    },
    
    /**
     * Save the high score to local storage
     */
    saveHighScore() {
        localStorage.setItem(Config.HIGH_SCORE_KEY, this.highScore.toString());
    },
    
    /**
     * Get the current score
     * @returns {number} - Current score
     */
    getScore() {
        return this.score;
    },
    
    /**
     * Get the high score
     * @returns {number} - High score
     */
    getHighScore() {
        return this.highScore;
    }
};