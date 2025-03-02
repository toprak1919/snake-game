/**
 * Audio Manager for Game Boy style sound effects
 */
const AudioManager = {
    // Sound references
    sounds: {
        move: null,
        eat: null,
        gameOver: null,
        start: null
    },

    // Volume level (0.0 to 1.0)
    volume: 0.5,
    
    // Mute state
    muted: false,

    /**
     * Initialize the audio manager
     */
    init() {
        // Load sound elements
        this.sounds.move = document.getElementById('move-sound');
        this.sounds.eat = document.getElementById('eat-sound');
        this.sounds.gameOver = document.getElementById('gameover-sound');
        this.sounds.start = document.getElementById('start-sound');

        // Create Game Boy sounds programmatically
        this.createGameBoySounds();
        
        // Set up volume slider
        this.setupVolumeControl();
    },

    /**
     * Create Game Boy style sound effects using Web Audio API
     */
    createGameBoySounds() {
        // We'll use AudioContext to create 8-bit style sounds
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn('Web Audio API not supported in this browser');
            return;
        }

        this.audioContext = new AudioContext();
        
        // Create sound buffers
        this.createMoveSound();
        this.createEatSound();
        this.createGameOverSound();
        this.createStartSound();
    },
    
    /**
     * Create a simple square wave oscillator sound
     * @param {number} frequency - Oscillator frequency
     * @param {number} duration - Sound duration in seconds
     * @param {string} type - Oscillator type (square, sine, etc.)
     */
    createTone(frequency, duration, type = 'square') {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Apply envelope for Game Boy sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return {
            oscillator,
            gainNode,
            start() {
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            }
        };
    },

    /**
     * Create the "move" sound
     */
    createMoveSound() {
        // Simple blip sound
        this.moveSound = () => {
            if (this.muted) return;
            const tone = this.createTone(150, 0.05);
            if (tone) tone.start();
        };
    },

    /**
     * Create the "eat" sound
     */
    createEatSound() {
        // Two-note sound when eating food
        this.eatSound = () => {
            if (this.muted) return;
            const tone1 = this.createTone(300, 0.1);
            const tone2 = this.createTone(450, 0.1);
            
            if (tone1 && tone2) {
                tone1.start();
                setTimeout(() => tone2.start(), 100);
            }
        };
    },

    /**
     * Create the "game over" sound
     */
    createGameOverSound() {
        // Descending notes for game over
        this.gameOverSound = () => {
            if (this.muted) return;
            
            // Play a series of descending notes
            const startFreq = 400;
            for (let i = 0; i < 5; i++) {
                const tone = this.createTone(startFreq - (i * 50), 0.2);
                if (tone) {
                    setTimeout(() => tone.start(), i * 180);
                }
            }
        };
    },

    /**
     * Create the "start" sound
     */
    createStartSound() {
        // Ascending notes for start
        this.startSound = () => {
            if (this.muted) return;
            
            // Play classic Game Boy startup-like sound
            const freqs = [300, 400, 500, 600];
            
            for (let i = 0; i < freqs.length; i++) {
                const tone = this.createTone(freqs[i], 0.15);
                if (tone) {
                    setTimeout(() => tone.start(), i * 100);
                }
            }
        };
    },
    
    /**
     * Set up volume control using the volume slider
     */
    setupVolumeControl() {
        const volumeKnob = document.querySelector('.volume-knob');
        const volumeTrack = document.querySelector('.volume-track');
        
        if (volumeKnob && volumeTrack) {
            // Make volume knob draggable
            let isDragging = false;
            let startY;
            let startTop;
            
            volumeKnob.addEventListener('mousedown', (e) => {
                isDragging = true;
                startY = e.clientY;
                startTop = parseInt(window.getComputedStyle(volumeKnob).top);
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaY = e.clientY - startY;
                const trackHeight = volumeTrack.clientHeight - volumeKnob.clientHeight;
                let newTop = Math.max(0, Math.min(trackHeight, startTop + deltaY));
                
                volumeKnob.style.top = newTop + 'px';
                
                // Calculate volume based on knob position
                const volume = 1 - (newTop / trackHeight);
                this.setVolume(volume);
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Touch support for mobile
            volumeKnob.addEventListener('touchstart', (e) => {
                isDragging = true;
                startY = e.touches[0].clientY;
                startTop = parseInt(window.getComputedStyle(volumeKnob).top);
                e.preventDefault();
            });
            
            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                const deltaY = e.touches[0].clientY - startY;
                const trackHeight = volumeTrack.clientHeight - volumeKnob.clientHeight;
                let newTop = Math.max(0, Math.min(trackHeight, startTop + deltaY));
                
                volumeKnob.style.top = newTop + 'px';
                
                // Calculate volume based on knob position
                const volume = 1 - (newTop / trackHeight);
                this.setVolume(volume);
            });
            
            document.addEventListener('touchend', () => {
                isDragging = false;
            });
        }
    },
    
    /**
     * Set the volume level
     * @param {number} level - Volume level (0.0 to 1.0)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        
        // Set volume on HTML audio elements if they exist
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.volume = this.volume;
        });
    },
    
    /**
     * Toggle mute state
     */
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },

    /**
     * Play the move sound
     */
    playMoveSound() {
        if (this.moveSound) this.moveSound();
    },

    /**
     * Play the eat sound
     */
    playEatSound() {
        if (this.eatSound) this.eatSound();
    },

    /**
     * Play the game over sound
     */
    playGameOverSound() {
        if (this.gameOverSound) this.gameOverSound();
    },

    /**
     * Play the start sound
     */
    playStartSound() {
        if (this.startSound) this.startSound();
    }
};
