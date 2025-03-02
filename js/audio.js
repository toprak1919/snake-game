/**
 * Audio Manager for Game Boy style sound effects
 */
const AudioManager = {
    // Audio context
    audioContext: null,
    
    // Volume level (0.0 to 1.0)
    volume: 0.5,
    
    // Mute state
    muted: false,
    
    // Flag to track initialization
    initialized: false,
    
    /**
     * Initialize the audio manager
     */
    init() {
        // Defer audio initialization until first user interaction
        this.setupVolumeControl();
    },
    
    /**
     * Initialize audio context after user interaction
     */
    initAudioContext() {
        if (this.initialized) return;
        
        try {
            // Using AudioContext to create 8-bit style sounds
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                
                // Resume context if suspended
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                this.initialized = true;
            }
        } catch (e) {
            console.warn('Web Audio API not supported in this browser');
            this.muted = true;
        }
    },
    
    /**
     * Create a simple square wave oscillator sound (8-bit style)
     * @param {number} frequency - Sound frequency in Hz
     * @param {number} duration - Sound duration in seconds
     * @returns {Object|null} - Sound object that can be played
     */
    createTone(frequency, duration) {
        if (!this.initialized || this.muted || !this.audioContext) return null;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Typical Game Boy sound (square wave)
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // Create volume envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            return {
                play() {
                    try {
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + duration);
                    } catch (e) {
                        console.warn('Error playing sound:', e);
                    }
                }
            };
        } catch (e) {
            console.warn('Error creating tone:', e);
            return null;
        }
    },
    
    /**
     * Set up volume control using the volume slider
     */
    setupVolumeControl() {
        const volumeKnob = document.getElementById('volume-knob');
        const volumeTrack = document.querySelector('.volume-track');
        
        if (volumeKnob && volumeTrack) {
            // Make volume knob draggable
            let isDragging = false;
            let startY;
            let startTop;
            
            const updateVolumeFromPosition = (newTop) => {
                const trackHeight = volumeTrack.clientHeight - volumeKnob.clientHeight;
                const boundedTop = Math.max(0, Math.min(trackHeight, newTop));
                volumeKnob.style.top = boundedTop + 'px';
                
                // Calculate volume (0 at bottom, 1 at top)
                const volume = 1 - (boundedTop / trackHeight);
                this.setVolume(volume);
            };
            
            volumeKnob.addEventListener('mousedown', (e) => {
                // Initialize audio on first interaction
                this.initAudioContext();
                
                isDragging = true;
                startY = e.clientY;
                startTop = parseInt(window.getComputedStyle(volumeKnob).top);
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaY = e.clientY - startY;
                updateVolumeFromPosition(startTop + deltaY);
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Initial volume setting
            updateVolumeFromPosition(25); // Middle position
        }
        
        // Add click listeners to other buttons to init audio
        const buttons = document.querySelectorAll('button, .btn-a, .btn-b, .btn-start, .btn-select, .dpad-up, .dpad-down, .dpad-left, .dpad-right');
        buttons.forEach(button => {
            button.addEventListener('mousedown', () => this.initAudioContext());
            button.addEventListener('touchstart', () => this.initAudioContext());
        });
        
        // Also init on any key press
        document.addEventListener('keydown', () => this.initAudioContext());
    },
    
    /**
     * Set the volume level
     * @param {number} level - Volume level (0.0 to 1.0)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    },
    
    /**
     * Toggle mute state
     * @returns {boolean} - New mute state
     */
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    },

    /**
     * Play the move sound
     */
    playMoveSound() {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        if (this.muted || !this.audioContext) return;
        
        // Create a quick blip sound
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.value = 150;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            console.warn('Error playing move sound:', e);
        }
    },

    /**
     * Play the eat sound
     */
    playEatSound() {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        if (this.muted || !this.audioContext) return;
        
        try {
            // First tone
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            
            osc1.type = 'square';
            osc1.frequency.value = 300;
            
            gain1.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain1.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gain1.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            
            osc1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            
            osc1.start();
            osc1.stop(this.audioContext.currentTime + 0.1);
            
            // Second tone
            setTimeout(() => {
                if (!this.audioContext) return;
                
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();
                
                osc2.type = 'square';
                osc2.frequency.value = 450;
                
                gain2.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain2.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
                gain2.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
                
                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);
                
                osc2.start();
                osc2.stop(this.audioContext.currentTime + 0.1);
            }, 100);
        } catch (e) {
            console.warn('Error playing eat sound:', e);
        }
    },

    /**
     * Play the game over sound
     */
    playGameOverSound() {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        if (this.muted || !this.audioContext) return;
        
        try {
            // Play a series of descending notes
            const startFreq = 400;
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    if (!this.audioContext) return;
                    
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.type = 'square';
                    osc.frequency.value = startFreq - (i * 50);
                    
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
                    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.2);
                }, i * 150);
            }
        } catch (e) {
            console.warn('Error playing game over sound:', e);
        }
    },

    /**
     * Play the start sound
     */
    playStartSound() {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        if (this.muted || !this.audioContext) return;
        
        try {
            // Create an ascending sequence of notes
            const freqs = [300, 400, 500, 600];
            for (let i = 0; i < freqs.length; i++) {
                setTimeout(() => {
                    if (!this.audioContext) return;
                    
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.type = 'square';
                    osc.frequency.value = freqs[i];
                    
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
                    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                }, i * 100);
            }
        } catch (e) {
            console.warn('Error playing start sound:', e);
        }
    },
    
    /**
     * Play power-up sound
     */
    playPowerUpSound() {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        if (this.muted || !this.audioContext) return;
        
        try {
            // Create a special power-up sound effect
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            
            osc1.type = 'square';
            osc1.frequency.value = 600;
            
            gain1.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain1.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gain1.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            
            osc1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            
            osc1.start();
            osc1.stop(this.audioContext.currentTime + 0.1);
            
            setTimeout(() => {
                if (!this.audioContext) return;
                
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();
                
                osc2.type = 'square';
                osc2.frequency.value = 800;
                
                gain2.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain2.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
                gain2.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
                
                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);
                
                osc2.start();
                osc2.stop(this.audioContext.currentTime + 0.1);
            }, 100);
        } catch (e) {
            console.warn('Error playing power-up sound:', e);
        }
    },
    
    /**
     * Play level up sound
     */
    playLevelUpSound() {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        if (this.muted || !this.audioContext) return;
        
        try {
            const freqs = [400, 500, 600, 700, 800];
            for (let i = 0; i < freqs.length; i++) {
                setTimeout(() => {
                    if (!this.audioContext) return;
                    
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.type = 'square';
                    osc.frequency.value = freqs[i];
                    
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
                    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                }, i * 80);
            }
        } catch (e) {
            console.warn('Error playing level up sound:', e);
        }
    }
};