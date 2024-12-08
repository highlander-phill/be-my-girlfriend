document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.querySelector('.envelope');
    const napkin = document.querySelector('.napkin');
    const celebration = document.getElementById('celebration');
    let game = null;
    
    // Open envelope on click
    envelope.addEventListener('click', () => {
        if (!envelope.classList.contains('open')) {
            envelope.classList.add('open');
            setTimeout(() => {
                napkin.classList.remove('hidden');
                setTimeout(() => {
                    napkin.classList.add('unfolded');
                }, 100);
            }, 500);
        }
    });

    // Add click handler for next button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-btn')) {
            const paperContent = document.querySelector('.paper-content');
            
            // Remove any existing event listeners from yes/no buttons
            const oldYesBtn = document.getElementById('yesBtn');
            const oldNoBtn = document.getElementById('noBtn');
            if (oldYesBtn) oldYesBtn.replaceWith(oldYesBtn.cloneNode(true));
            if (oldNoBtn) oldNoBtn.replaceWith(oldNoBtn.cloneNode(true));
            
            // Flip the paper
            paperContent.classList.add('flipped');
            
            // Setup new button listeners after a short delay
            setTimeout(() => {
                const noBtn = document.getElementById('noBtn');
                const yesBtn = document.getElementById('yesBtn');
                
                // Move the no button next to yes
                if (yesBtn && noBtn) {
                    yesBtn.insertAdjacentElement('afterend', noBtn);
                }
                
                setupButtonListeners(noBtn, yesBtn);
            }, 100);
        }
    });

    function setupButtonListeners(noBtn, yesBtn) {
        let moveCount = 0;
        const maxMoves = 10;
        
        function moveButton() {
            // Get viewport dimensions
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const buttonWidth = noBtn.offsetWidth;
            const buttonHeight = noBtn.offsetHeight;
            
            // Keep button within the center area of the screen
            const centerX = screenWidth / 2;
            const centerY = screenHeight / 2;
            const maxDistance = Math.min(screenWidth, screenHeight) * 0.3; // 30% of screen
            
            // Random angle between 0 and 2π
            const angle = Math.random() * Math.PI * 2;
            // Random distance from center, but not too far
            const distance = Math.random() * maxDistance;
            
            // Calculate new position
            const newX = centerX + Math.cos(angle) * distance - buttonWidth / 2;
            const newY = centerY + Math.sin(angle) * distance - buttonHeight / 2;
            
            noBtn.style.position = 'fixed';
            noBtn.style.left = `${newX}px`;
            noBtn.style.top = `${newY}px`;
            noBtn.style.zIndex = '1000';
            
            // Add funny messages back
            const messages = ["Really?", "Are you sure?", "Think again!", "Pretty please?", "Don't do this!", "But why?", "Give it a chance!", "One more thought?"];
            noBtn.textContent = messages[Math.floor(Math.random() * messages.length)];
            
            moveCount++;
            if (moveCount >= maxMoves) {
                noBtn.style.display = 'none';
            }
        }
        
        if (noBtn) {
            noBtn.addEventListener('mouseover', moveButton);
            noBtn.addEventListener('touchstart', moveButton);
        }
        
        if (yesBtn) {
            yesBtn.addEventListener('click', () => {
                celebration.style.display = 'block';
                // Initialize game after showing celebration screen
                setTimeout(() => {
                    game = new PacMan(document.getElementById('gameCanvas'));
                }, 100);
            });
        }
    }

    // Initial setup of button listeners
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    if (yesBtn && noBtn) {
        yesBtn.insertAdjacentElement('afterend', noBtn);
    }
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
        this.canvas.width = 400;
        this.canvas.height = 300;
        
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
        this.ctx.fillText(`Disappointed Guys' Hearts Collected: ${this.score}`, this.canvas.width / 2, 40);
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
