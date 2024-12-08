document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.querySelector('.envelope');
    const napkin = document.querySelector('.napkin');
    const celebration = document.getElementById('celebration');
    let game = null;
    
    // Handle both click and touch events for envelope
    function handleEnvelopeOpen(e) {
        e.preventDefault();  // Prevent double-tap zoom on mobile
        if (!envelope.classList.contains('open')) {
            envelope.classList.add('open');
            setTimeout(() => {
                napkin.classList.remove('hidden');
                setTimeout(() => {
                    napkin.classList.add('unfolded');
                }, 100);
            }, 500);
        }
    }
    
    if (envelope) {
        envelope.addEventListener('click', handleEnvelopeOpen);
        envelope.addEventListener('touchstart', handleEnvelopeOpen);
    }

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
            direction: 0,
            speed: 4
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
        // Move character based on keyboard input
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
        
        // Keep character in bounds
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
        
        // Draw game elements
        this.hearts.forEach(heart => this.drawHeart(heart));
        this.drawParticles();
        this.drawPlayer();
        
        // Draw score text with background
        this.ctx.save();
        // Add semi-transparent background for text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textMetrics = this.ctx.measureText(`Disappointed Guys' Hearts: ${this.score}`);
        const padding = 10;
        this.ctx.fillRect(
            this.canvas.width / 2 - textMetrics.width / 2 - padding,
            10,
            textMetrics.width + padding * 2,
            40
        );
        
        // Draw score text
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillText(`Disappointed Guys' Hearts: ${this.score}`, this.canvas.width / 2, 40);
        this.ctx.restore();
    }
    
    drawPlayer() {
        const { x, y, radius, direction } = this.pacman;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(direction);
        
        const scale = radius / 12;
        
        // Legs with boots
        this.ctx.fillStyle = '#FFE4C4';  // Skin tone for legs
        this.ctx.beginPath();
        // Right leg
        this.ctx.moveTo(5 * scale, 5 * scale);
        this.ctx.lineTo(7 * scale, 18 * scale);
        this.ctx.lineTo(3 * scale, 18 * scale);
        this.ctx.lineTo(2 * scale, 5 * scale);
        // Left leg
        this.ctx.moveTo(-5 * scale, 5 * scale);
        this.ctx.lineTo(-7 * scale, 18 * scale);
        this.ctx.lineTo(-3 * scale, 18 * scale);
        this.ctx.lineTo(-2 * scale, 5 * scale);
        this.ctx.fill();

        // Boots
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        // Right boot
        this.ctx.moveTo(7 * scale, 18 * scale);
        this.ctx.lineTo(8 * scale, 22 * scale);
        this.ctx.lineTo(2 * scale, 22 * scale);
        this.ctx.lineTo(3 * scale, 18 * scale);
        // Left boot
        this.ctx.moveTo(-7 * scale, 18 * scale);
        this.ctx.lineTo(-8 * scale, 22 * scale);
        this.ctx.lineTo(-2 * scale, 22 * scale);
        this.ctx.lineTo(-3 * scale, 18 * scale);
        this.ctx.fill();
        
        // Short dress
        this.ctx.fillStyle = '#FF1493';  // Deep pink
        this.ctx.beginPath();
        this.ctx.moveTo(0, -15 * scale);
        // Right side with curve
        this.ctx.quadraticCurveTo(10 * scale, -12 * scale, 12 * scale, -5 * scale);
        this.ctx.quadraticCurveTo(10 * scale, 0, 8 * scale, 5 * scale);
        // Bottom of dress
        this.ctx.quadraticCurveTo(0, 7 * scale, -8 * scale, 5 * scale);
        // Left side with curve
        this.ctx.quadraticCurveTo(-10 * scale, 0, -12 * scale, -5 * scale);
        this.ctx.quadraticCurveTo(-10 * scale, -12 * scale, 0, -15 * scale);
        this.ctx.fill();

        // Cleavage detail
        this.ctx.strokeStyle = '#FF1493';
        this.ctx.lineWidth = 1.5 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(-4 * scale, -12 * scale);
        this.ctx.quadraticCurveTo(0, -8 * scale, 4 * scale, -12 * scale);
        this.ctx.stroke();
        
        // Head
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.beginPath();
        this.ctx.arc(0, -20 * scale, 8 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair with volume
        this.ctx.fillStyle = '#4A3000';
        // Back hair
        this.ctx.beginPath();
        this.ctx.moveTo(-8 * scale, -24 * scale);
        this.ctx.quadraticCurveTo(-12 * scale, -15 * scale, -10 * scale, -5 * scale);
        this.ctx.quadraticCurveTo(-8 * scale, -10 * scale, -6 * scale, -15 * scale);
        this.ctx.fill();
        
        // Front hair
        this.ctx.beginPath();
        this.ctx.moveTo(-8 * scale, -28 * scale);
        this.ctx.quadraticCurveTo(0, -32 * scale, 8 * scale, -28 * scale);
        this.ctx.quadraticCurveTo(12 * scale, -24 * scale, 10 * scale, -18 * scale);
        this.ctx.quadraticCurveTo(6 * scale, -22 * scale, 0, -24 * scale);
        this.ctx.quadraticCurveTo(-6 * scale, -22 * scale, -8 * scale, -28 * scale);
        this.ctx.fill();
        
        // Face features
        // Eyes with makeup
        this.ctx.fillStyle = '#4A3000';
        this.ctx.beginPath();
        this.ctx.ellipse(-3 * scale, -21 * scale, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        this.ctx.ellipse(3 * scale, -21 * scale, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyelashes and makeup
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 0.8 * scale;
        [-3, 3].forEach(eyeX => {
            for(let i = -1; i <= 1; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(eyeX * scale, (-21 - 2) * scale);
                this.ctx.lineTo((eyeX + i) * scale, (-21 - 3.5) * scale);
                this.ctx.stroke();
            }
        });
        
        // Red lips
        this.ctx.beginPath();
        this.ctx.arc(0, -18 * scale, 3 * scale, 0.1, Math.PI - 0.1);
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 1.2 * scale;
        this.ctx.stroke();
        
        this.ctx.restore();
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
