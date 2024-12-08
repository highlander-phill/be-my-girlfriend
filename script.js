document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.querySelector('.envelope');
    const napkin = document.querySelector('.napkin');
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const celebration = document.getElementById('celebration');
    const questionText = document.querySelector('.question-text');
    let game = null;
    
    // Open envelope on click
    let isAnimating = false;
    envelope.addEventListener('click', () => {
        if (isAnimating) return; // Prevent multiple clicks
        isAnimating = true;
        
        envelope.classList.add('open');
        setTimeout(() => {
            napkin.classList.remove('hidden');
            // Show content with animation
            setTimeout(() => {
                napkin.classList.add('unfolding');
                // Show transition message
                questionText.innerHTML = `
                    <p class="intro">Hey Tanya... 💕</p>
                    <p class="transition-message">I think transitioning into a relationship is a big deal. I take it very seriously... 😊<br>
                    I like you so much I'm letting us skip the travel rule...<br>
                    I also think it's "cute" to formally ask....so......</p>
                    <button class="next-btn">next ❤️</button>
                `;
                
                // Add click handler for next button
                const nextBtn = document.querySelector('.next-btn');
                nextBtn.addEventListener('click', () => {
                    questionText.innerHTML = `
                        <p class="intro">Hey Tanya... 💕</p>
                        <p class="main-question">will you be my girlfriend?</p>
                        <div class="checkbox-area">
                            <div class="checkbox-option">
                                <button id="yesBtn" class="yes-btn">yes</button>
                            </div>
                            <div class="checkbox-option">
                                <button id="noBtn" class="no-btn">no</button>
                            </div>
                        </div>
                    `;
                    
                    // Reattach event listeners to the new buttons
                    const newNoBtn = document.getElementById('noBtn');
                    const newYesBtn = document.getElementById('yesBtn');
                    setupButtonListeners(newNoBtn, newYesBtn);
                });
            }, 100);
            isAnimating = false;
        }, 1000);
        isAnimating = false; // Reset animation flag
    });

    function setupButtonListeners(noBtn, yesBtn) {
        let moveCount = 0;
        const maxMoves = 10;
        
        // Make the "No" button run away from the cursor with effects
        noBtn.addEventListener('mouseover', () => {
            moveCount++;
            
            // Calculate new position within a more restricted area
            const maxX = window.innerWidth * 0.7 - noBtn.offsetWidth;
            const maxY = window.innerHeight * 0.7 - noBtn.offsetHeight;
            const minX = window.innerWidth * 0.1;
            const minY = window.innerHeight * 0.1;
            
            const newX = Math.min(Math.max(minX, Math.random() * maxX), maxX);
            const newY = Math.min(Math.max(minY, Math.random() * maxY), maxY);
            
            // Add random rotation
            const rotation = Math.random() * 360;
            
            noBtn.style.position = 'fixed';
            noBtn.style.left = `${newX}px`;
            noBtn.style.top = `${newY}px`;
            noBtn.style.transform = `rotate(${rotation}deg)`;
            
            // Add effects based on move count
            if (moveCount > maxMoves / 2) {
                noBtn.style.opacity = Math.max(0.3, 1 - (moveCount / maxMoves));
                noBtn.style.fontSize = Math.max(0.8, 1 - (moveCount / maxMoves * 0.5)) + 'em';
            }
            
            // Add funny messages
            const messages = ["Really?", "Are you sure?", "Think again!", "Pretty please?", "Don't do this!"];
            noBtn.textContent = messages[Math.floor(Math.random() * messages.length)];
        });
        
        // Handle the "Yes" click
        yesBtn.addEventListener('click', () => {
            napkin.style.display = 'none';
            envelope.style.display = 'none';
            celebration.classList.add('show');
            
            // Initialize Pac-Man game
            const canvas = document.getElementById('gameCanvas');
            game = new PacMan(canvas);
            
            // Create floating hearts in the background
            for (let i = 0; i < 50; i++) {
                createHeart();
            }
        });
    }

    // Initial setup of button listeners
    setupButtonListeners(noBtn, yesBtn);
});

class PacMan {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pacman = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 20,
            mouthOpen: 0,
            mouthDir: 1,
            direction: 0,
            speed: 4,
            color: '#FFFF00'
        };
        this.hearts = [];
        this.particles = [];
        this.score = 0;
        this.keys = {};
        
        // Set canvas size
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        // Create initial hearts
        this.createHearts(15);
        
        // Event listeners for keyboard
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // Touch controls
        const upBtn = document.querySelector('.up-btn');
        const downBtn = document.querySelector('.down-btn');
        const leftBtn = document.querySelector('.left-btn');
        const rightBtn = document.querySelector('.right-btn');
        
        // Handle both touch and mouse events
        const handleStart = (key) => {
            this.keys[key] = true;
        };
        
        const handleEnd = (key) => {
            this.keys[key] = false;
        };
        
        // Add both touch and click events for each button
        if (upBtn) {
            upBtn.addEventListener('touchstart', () => handleStart('ArrowUp'));
            upBtn.addEventListener('touchend', () => handleEnd('ArrowUp'));
            upBtn.addEventListener('mousedown', () => handleStart('ArrowUp'));
            upBtn.addEventListener('mouseup', () => handleEnd('ArrowUp'));
            upBtn.addEventListener('mouseleave', () => handleEnd('ArrowUp'));
        }
        if (downBtn) {
            downBtn.addEventListener('touchstart', () => handleStart('ArrowDown'));
            downBtn.addEventListener('touchend', () => handleEnd('ArrowDown'));
            downBtn.addEventListener('mousedown', () => handleStart('ArrowDown'));
            downBtn.addEventListener('mouseup', () => handleEnd('ArrowDown'));
            downBtn.addEventListener('mouseleave', () => handleEnd('ArrowDown'));
        }
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', () => handleStart('ArrowLeft'));
            leftBtn.addEventListener('touchend', () => handleEnd('ArrowLeft'));
            leftBtn.addEventListener('mousedown', () => handleStart('ArrowLeft'));
            leftBtn.addEventListener('mouseup', () => handleEnd('ArrowLeft'));
            leftBtn.addEventListener('mouseleave', () => handleEnd('ArrowLeft'));
        }
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', () => handleStart('ArrowRight'));
            rightBtn.addEventListener('touchend', () => handleEnd('ArrowRight'));
            rightBtn.addEventListener('mousedown', () => handleStart('ArrowRight'));
            rightBtn.addEventListener('mouseup', () => handleEnd('ArrowRight'));
            rightBtn.addEventListener('mouseleave', () => handleEnd('ArrowRight'));
        }
        
        // Prevent default behavior
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => e.preventDefault());
            btn.addEventListener('touchend', (e) => e.preventDefault());
            btn.addEventListener('mousedown', (e) => e.preventDefault());
            btn.addEventListener('mouseup', (e) => e.preventDefault());
        });
        
        // Start game loop
        this.gameLoop();
    }
    
    createHearts(count) {
        for (let i = 0; i < count; i++) {
            this.hearts.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                size: 15,
                rotation: Math.random() * Math.PI * 2,
                collected: false,
                pulseScale: 1,
                pulseDir: 0.02
            });
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 5,
                color,
                life: 1
            });
        }
    }
    
    drawPacMan() {
        const { x, y, radius, mouthOpen, direction, color } = this.pacman;
        
        // Draw glow effect
        const gradient = this.ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.5);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw Pac-Man body
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(direction);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, mouthOpen, Math.PI * 2 - mouthOpen);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw eye
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(radius * 0.3, -radius * 0.5, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawHeart(heart) {
        if (heart.collected) return;
        
        this.ctx.save();
        this.ctx.translate(heart.x, heart.y);
        this.ctx.rotate(heart.rotation);
        this.ctx.scale(heart.pulseScale, heart.pulseScale);
        
        // Draw heart glow
        const gradient = this.ctx.createRadialGradient(0, 0, heart.size * 0.5, 0, 0, heart.size * 2);
        gradient.addColorStop(0, 'rgba(231, 76, 60, 0.3)');
        gradient.addColorStop(1, 'rgba(231, 76, 60, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.drawHeartPath(this.ctx, 0, 0, heart.size * 1.5);
        this.ctx.fill();
        
        // Draw heart
        this.ctx.beginPath();
        this.drawHeartPath(this.ctx, 0, 0, heart.size);
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Update pulse animation
        heart.pulseScale += heart.pulseDir;
        if (heart.pulseScale > 1.2 || heart.pulseScale < 0.8) {
            heart.pulseDir *= -1;
        }
    }
    
    drawHeartPath(ctx, x, y, size) {
        ctx.moveTo(x, y + size / 2);
        ctx.bezierCurveTo(
            x + size / 2, y - size / 2,
            x + size, y + size / 2,
            x, y + size * 1.5
        );
        ctx.bezierCurveTo(
            x - size, y + size / 2,
            x - size / 2, y - size / 2,
            x, y + size / 2
        );
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.size *= 0.95;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(231, 76, 60, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    update() {
        // Update mouth animation
        this.pacman.mouthOpen += 0.15 * this.pacman.mouthDir;
        if (this.pacman.mouthOpen > 0.5 || this.pacman.mouthOpen < 0) {
            this.pacman.mouthDir *= -1;
        }
        
        // Move Pac-Man based on keyboard input
        let moving = false;
        if (this.keys['ArrowLeft']) {
            this.pacman.x -= this.pacman.speed;
            this.pacman.direction = Math.PI;
            moving = true;
        }
        if (this.keys['ArrowRight']) {
            this.pacman.x += this.pacman.speed;
            this.pacman.direction = 0;
            moving = true;
        }
        if (this.keys['ArrowUp']) {
            this.pacman.y -= this.pacman.speed;
            this.pacman.direction = -Math.PI/2;
            moving = true;
        }
        if (this.keys['ArrowDown']) {
            this.pacman.y += this.pacman.speed;
            this.pacman.direction = Math.PI/2;
            moving = true;
        }
        
        // Only animate mouth when moving
        if (!moving) {
            this.pacman.mouthOpen = Math.max(0, this.pacman.mouthOpen - 0.1);
        }
        
        // Keep Pac-Man in bounds
        this.pacman.x = Math.max(this.pacman.radius, Math.min(this.canvas.width - this.pacman.radius, this.pacman.x));
        this.pacman.y = Math.max(this.pacman.radius, Math.min(this.canvas.height - this.pacman.radius, this.pacman.y));
        
        // Check collision with hearts
        this.hearts.forEach(heart => {
            if (!heart.collected) {
                const dx = heart.x - this.pacman.x;
                const dy = heart.y - this.pacman.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.pacman.radius + heart.size) {
                    heart.collected = true;
                    this.score++;
                    this.createParticles(heart.x, heart.y, '#e74c3c');
                    
                    // Create new hearts when all are collected
                    if (this.hearts.every(h => h.collected)) {
                        this.createHearts(15);
                    }
                }
            }
        });
        
        // Update particles
        this.updateParticles();
    }
    
    draw() {
        // Clear canvas with trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw score with glow effect
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 30px Caveat';
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(`Hearts Collected: ${this.score}`, this.canvas.width / 2, 40);
        this.ctx.shadowBlur = 0;
        
        // Draw game elements
        this.hearts.forEach(heart => this.drawHeart(heart));
        this.drawParticles();
        this.drawPacMan();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

function createHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '💖';
    heart.style.position = 'fixed';
    heart.style.fontSize = Math.random() * 20 + 10 + 'px';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh';
    heart.style.opacity = '0';
    heart.style.transform = `rotate(${Math.random() * 360}deg)`;
    heart.style.transition = 'all ' + (Math.random() * 2 + 3) + 's ease-out';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.style.opacity = '1';
        heart.style.top = '-50px';
    }, 100);
    
    setTimeout(() => {
        heart.remove();
    }, 5000);
}
