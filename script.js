// --- GLOBAL VARIABLES ---
let gameLoopId;
let activeGame = null;
let pacNextDir = 0;

// Unified Input State (Works for both Touch and Keyboard)
let input = {
    left: false,
    right: false,
    up: false,
    down: false,
    action: false // Jump or Fire
};

// --- HELPER FUNCTIONS ---
function resetInput() {
    input = { left: false, right: false, up: false, down: false, action: false };
}

function resetToMenu() {
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    activeGame = null;
    resetInput();
    
    document.getElementById('arcade-wrap').style.display = 'none';
    document.getElementById('game-selection').style.display = 'block';
    
    // Hide overlays
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('dpad').classList.add('hidden');
    document.getElementById('jump-btn').classList.add('hidden');
}

function initGame(type) {
    // Switch UI
    document.getElementById('game-selection').style.display = 'none';
    
    const arcadeWrap = document.getElementById('arcade-wrap');
    arcadeWrap.classList.remove('hidden');
    arcadeWrap.style.display = 'block'; 
    
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('game-over').style.display = 'none';
    
    // Show Controls
    document.getElementById('dpad').classList.remove('hidden');
    // Only show action button for specific games if needed, but keeping hidden by default for cleaner UI
    // document.getElementById('jump-btn').classList.remove('hidden'); 

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    activeGame = type;
    resetInput();
    
    let score = 0;
    document.getElementById('score').innerText = '0';
    let frame = 0;
    let alive = true;

    // --- PAC-MAN ---
    if (type === 'pacman') {
        canvas.width = 336; canvas.height = 380;
        const TILE = 16;
        // Simple map layout
        const map = [
            [1,1,1,1,1,1,1,1,1,9,9,9,1,1,1,1,1,1,1,1,1], [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,8,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,8,1], [1,0,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], [1,0,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1], [1,1,1,1,1,1,0,1,1,9,9,9,1,1,0,1,1,1,1,1,1],
            [9,9,9,9,9,9,0,1,9,9,9,9,9,1,0,9,9,9,9,9,9], [1,1,1,1,1,1,0,1,9,9,9,9,9,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1], [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
            [1,8,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,8,1], [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], [1,1,1,1,1,1,1,1,1,9,9,9,1,1,1,1,1,1,1,1,1]
        ];
        let player = { x: 10, y: 14, dir: 0 };
        let ghosts = [ 
            { x: 9, y: 8, color: 'red', dir: 1, vulnerable: false }, 
            { x: 10, y: 8, color: 'pink', dir: -1, vulnerable: false }, 
            { x: 11, y: 8, color: 'cyan', dir: 1, vulnerable: false } 
        ];
        let powerTimer = 0; pacNextDir = 0;

        function pacLoop() {
            if(!alive) return;
            frame++;
            if(powerTimer > 0) powerTimer--;
            
            // Handle Input Direction
            if (input.up) pacNextDir = 1;
            if (input.down) pacNextDir = 3;
            if (input.left) pacNextDir = 2;
            if (input.right) pacNextDir = 0;

            // Draw Background
            ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height);
            
            // Draw Map
            for(let y=0; y<map.length; y++) for(let x=0; x<map[y].length; x++) {
                if(map[y][x]===1) { ctx.fillStyle='#1919A6'; ctx.fillRect(x*TILE, y*TILE, TILE, TILE); }
                else if(map[y][x]===0) { ctx.fillStyle='#ffb8ae'; ctx.beginPath(); ctx.arc(x*TILE+8,y*TILE+8, 4, 0, Math.PI*2); ctx.fill(); }
                else if(map[y][x]===8) { ctx.fillStyle=(frame%20<10)?'#ffb8ae':'#000'; ctx.beginPath(); ctx.arc(x*TILE+8,y*TILE+8,6,0,Math.PI*2); ctx.fill(); }
            }

            // Move Player
            let moveRate = Math.max(5, 12 - Math.floor(score/200)); 
            if(frame % moveRate === 0) {
                // Try changing direction
                let dx=0, dy=0; 
                if(pacNextDir===0) dx=1; if(pacNextDir===1) dy=-1; if(pacNextDir===2) dx=-1; if(pacNextDir===3) dy=1;
                
                let nextX=player.x+dx, nextY=player.y+dy;
                // Wrap
                if(nextX<0) nextX=map[0].length-1; if(nextX>=map[0].length) nextX=0; 
                if(nextY<0) nextY=map.length-1; if(nextY>=map.length) nextY=0;
                
                // If walkable, set direction
                if(map[nextY][nextX]!==1) player.dir=pacNextDir;
                
                // Apply movement
                dx=0; dy=0; 
                if(player.dir===0) dx=1; if(player.dir===1) dy=-1; if(player.dir===2) dx=-1; if(player.dir===3) dy=1;
                let destX=player.x+dx, destY=player.y+dy;
                
                // Wrap dest
                if(destX<0) player.x=map[0].length-1; else if(destX>=map[0].length) player.x=0; 
                else if(destY<0) player.y=map.length-1; else if(destY>=map.length) player.y=0; 
                else if(map[destY][destX]!==1) { player.x=destX; player.y=destY; }
                
                // Eat dots
                let tile=map[player.y][player.x];
                if(tile===0) { map[player.y][player.x]=9; document.getElementById('score').innerText=(score+=10); }
                else if(tile===8) { map[player.y][player.x]=9; document.getElementById('score').innerText=(score+=50); powerTimer=400; ghosts.forEach(g=>g.vulnerable=true); }
            }

            // Move Ghosts
            if(frame % (moveRate + 4) === 0) {
                ghosts.forEach(g => {
                    if(g.vulnerable && frame % ((moveRate+4)*2) !== 0) return;
                    let dirs=[], upY=g.y-1<0?map.length-1:g.y-1, downY=g.y+1>=map.length?0:g.y+1, leftX=g.x-1<0?map[0].length-1:g.x-1, rightX=g.x+1>=map[0].length?0:g.x+1;
                    if(map[upY][g.x]!==1) dirs.push(1); if(map[downY][g.x]!==1) dirs.push(3); if(map[g.y][leftX]!==1) dirs.push(2); if(map[g.y][rightX]!==1) dirs.push(0);
                    if(dirs.length>0) g.dir = dirs[Math.floor(Math.random()*dirs.length)];
                    
                    if(g.dir===0) g.x++; if(g.dir===1) g.y--; if(g.dir===2) g.x--; if(g.dir===3) g.y++;
                    // Wrap Ghost
                    if(g.x<0) g.x=map[0].length-1; if(g.x>=map[0].length) g.x=0; 
                    if(g.y<0) g.y=map.length-1; if(g.y>=map.length) g.y=0;
                    
                    if(g.x===player.x && g.y===player.y) {
                        if(g.vulnerable) { g.x=10; g.y=8; g.vulnerable=false; document.getElementById('score').innerText=(score+=200); }
                        else { alive=false; document.getElementById('game-over').style.display='block'; }
                    }
                });
            }
            if(powerTimer===0) ghosts.forEach(g=>g.vulnerable=false);
            
            // Draw Player
            ctx.save();
            ctx.translate(player.x*TILE+8, player.y*TILE+8);
            if(player.dir === 1) ctx.rotate(-Math.PI/2); 
            if(player.dir === 2) ctx.rotate(Math.PI);    
            if(player.dir === 3) ctx.rotate(Math.PI/2); 
            ctx.fillStyle='yellow'; ctx.beginPath(); ctx.arc(0, 0, 7, 0.2*Math.PI, 1.8*Math.PI); ctx.lineTo(0,0); ctx.fill();
            ctx.restore();

            // Draw Ghosts
            ghosts.forEach(g => { 
                ctx.fillStyle=g.vulnerable?(powerTimer<100 && frame%10<5?'white':'blue'):g.color; 
                ctx.beginPath(); ctx.arc(g.x*TILE+8,g.y*TILE+8,7,0,Math.PI*2); ctx.fill(); 
            });
            
            gameLoopId = requestAnimationFrame(pacLoop);
        }
        pacLoop();

    // --- INVADERS (FIXED MOVEMENT) ---
    } else if (type === 'invaders') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 150, w: 40, h: 20 }, bullets = [], invaders = [], invDir = 1;
        for(let r=0; r<4; r++) for(let c=0; c<6; c++) invaders.push({ x: 30+c*45, y: 30+r*35, t: r===0?'🐙':'👾' });
        
        function fire() { bullets.push({ x: player.x+15, y: 400 }); }

        function invLoop() {
            if(!alive) return; frame++;
            ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            
            // Movement Fix: Check global input state
            if(input.left) player.x -= 5; 
            if(input.right) player.x += 5; 
            if(input.action && frame % 10 === 0) fire(); // Auto-fire if holding action/space/touch

            player.x = Math.max(0, Math.min(canvas.width-40, player.x));

            // Invader Logic
            if(frame%40===0) { 
                let hitEdge=false; 
                invaders.forEach(inv=>{
                    inv.x+=(10*invDir); 
                    if(inv.x>canvas.width-30 || inv.x<0) hitEdge=true;
                }); 
                if(hitEdge) { invDir*=-1; invaders.forEach(inv=>inv.y+=10); } 
            }
            
            // Draw Invaders
            ctx.fillStyle='red'; ctx.font='24px Arial'; 
            invaders.forEach(inv=>{
                ctx.fillText(inv.t,inv.x,inv.y); 
                if(inv.y>380) {alive=false; document.getElementById('game-over').style.display='block';}
            });
            
            // Bullets
            bullets.forEach((b,i)=>{
                b.y-=7; ctx.fillText('❤️',b.x,b.y); 
                // Improved Collision Detection (Wider)
                invaders.forEach((inv,ii)=>{
                    if(b.x > inv.x - 10 && b.x < inv.x + 40 && b.y < inv.y + 10 && b.y > inv.y - 30) {
                        invaders.splice(ii,1); bullets.splice(i,1); 
                        document.getElementById('score').innerText=(score+=100);
                    }
                });
            });
            
            // Player
            ctx.fillStyle='#00ff00'; ctx.fillRect(player.x,420,40,20); ctx.fillRect(player.x+15,410,10,10);
            
            if(invaders.length===0) { 
                document.getElementById('game-over').querySelector('h2').innerText="YOU WIN!"; 
                alive=false; 
                document.getElementById('game-over').style.display='block'; 
            }
            gameLoopId=requestAnimationFrame(invLoop);
        }
        invLoop();

    // --- PAPERBOY (FIXED MOVEMENT) ---
    } else if (type === 'paperboy') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 170, y: 350 }, world = [], hearts = [];
        
        function pbLoop() {
            if(!alive) return; frame++;
            
            // Draw Grass
            ctx.fillStyle='#2d5a27'; ctx.fillRect(0,0,340,450); 
            // Draw Road
            ctx.fillStyle='#555'; ctx.beginPath(); ctx.moveTo(100,0); ctx.lineTo(340,0); ctx.lineTo(340,450); ctx.lineTo(100,450); ctx.fill(); 
            // Draw Sidewalk
            ctx.fillStyle='#777'; ctx.fillRect(80,0,20,450);
            
            // Movement Fix: Check global input state
            if(input.left) player.x -= 5; 
            if(input.right) player.x += 5; 
            if(input.action && frame % 15 === 0) hearts.push({x:player.x+20,y:player.y,vx:-5,vy:-5});

            player.x = Math.max(100, Math.min(300, player.x));
            
            // Spawn Stuff
            if(frame%40===0) { 
                let isHouse = Math.random()>0.4; 
                let spawnX = isHouse ? (Math.random() * 60) : (120 + Math.random() * 200); 
                world.push({x:spawnX, y:-50, t:isHouse?'🏠':'🚗', hit:false, isCar:!isHouse, speed: 4+Math.random()*2}); 
            }

            world.forEach((w,i)=>{
                w.y += w.speed; 
                if(w.isCar && w.y<0) w.x = Math.max(120, Math.min(300, w.x)); 
                
                ctx.font='40px Arial'; ctx.fillText(w.hit?'💖':w.t, w.x, w.y); 
                
                // Car Collision
                if(w.isCar && Math.abs(player.x - w.x) < 30 && Math.abs(player.y - w.y) < 30) {
                    alive=false; document.getElementById('game-over').style.display='block';
                } 
                if(w.y>500) world.splice(i,1);
            });

            // Throw Hearts
            hearts.forEach((h,i)=>{
                h.x+=h.vx; h.y+=h.vy; 
                ctx.font='20px Arial'; ctx.fillText('❤️',h.x,h.y); 
                
                // House Hit Logic
                world.forEach(w=>{
                    if(w.t==='🏠' && !w.hit && Math.abs(h.x - w.x) < 40 && Math.abs(h.y - w.y) < 40){
                        w.hit=true;
                        document.getElementById('score').innerText=(score+=50);
                    }
                });
            });

            ctx.font='40px Arial'; ctx.fillText('🚲', player.x, player.y);
            gameLoopId=requestAnimationFrame(pbLoop);
        }
        pbLoop();
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Basic Page Setup
    const envWrap = document.getElementById('envelope-wrap');
    const flap = document.getElementById('flap');
    const paper = document.getElementById('main-paper');
    const area = document.getElementById('actionArea');
    const no = document.getElementById('noBtn');
    const termsModal = document.getElementById('terms-modal');
    const celebration = document.getElementById('celebration');
    
    // Reset View
    termsModal.classList.add('hidden');
    celebration.style.display = 'none'; 
    document.getElementById('current-date').innerText = new Date().toLocaleDateString();

    // Interaction Handlers
    envWrap.addEventListener('click', () => {
        if(envWrap.classList.contains('open')) return;
        envWrap.classList.add('open');
        setTimeout(() => {
            envWrap.classList.add('fly-away');
            setTimeout(() => {
                envWrap.classList.add('hidden');
                flap.style.display = 'none';
                paper.classList.remove('hidden');
                void paper.offsetWidth; 
                paper.classList.add('visible');
            }, 500);
        }, 600);
    });

    const moveNo = () => {
        no.style.left = Math.random() * (area.clientWidth - no.offsetWidth) + 'px';
        no.style.top = Math.random() * (area.clientHeight - no.offsetHeight) + 'px';
        no.style.transform = 'none';
    };
    no.addEventListener('mouseover', moveNo);
    no.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); });

    document.getElementById('yesBtn').addEventListener('click', () => {
        paper.style.transition = "transform 0.8s ease-in";
        paper.style.transform = "translateY(-150%) rotate(10deg)";
        setTimeout(() => {
            paper.classList.add('hidden');
            termsModal.classList.remove('hidden'); 
        }, 500);
    });

    // Contract Acceptance
    const termsCheck = document.getElementById('terms-checkbox');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    if(termsCheck) {
        termsCheck.addEventListener('change', (e) => {
            if(e.target.checked) acceptTermsBtn.classList.remove('disabled');
            else acceptTermsBtn.classList.add('disabled');
        });
    }
    if(acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', () => {
            termsModal.classList.add('hidden');
            celebration.classList.remove('hidden');
            celebration.style.display = 'block'; 
            resetToMenu();
        });
    }

    // --- GLOBAL INPUT LISTENERS ---
    
    // Keyboard
    window.addEventListener('keydown', (e) => {
        if(e.code === 'ArrowLeft') input.left = true;
        if(e.code === 'ArrowRight') input.right = true;
        if(e.code === 'ArrowUp') input.up = true;
        if(e.code === 'ArrowDown') input.down = true;
        if(e.code === 'Space') input.action = true;
        // Also trigger firing for Space
        if(e.code === 'Space' && activeGame === 'invaders') {
             // Logic handled in game loop or specific fire function if needed
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if(e.code === 'ArrowLeft') input.left = false;
        if(e.code === 'ArrowRight') input.right = false;
        if(e.code === 'ArrowUp') input.up = false;
        if(e.code === 'ArrowDown') input.down = false;
        if(e.code === 'Space') input.action = false;
    });

    // Touch D-Pad
    const bindTouch = (id, direction) => {
        const btn = document.getElementById(id);
        if(!btn) return;
        
        const set = (state) => {
            if(direction === 'left') input.left = state;
            if(direction === 'right') input.right = state;
            if(direction === 'up') input.up = state;
            if(direction === 'down') input.down = state;
        };

        btn.addEventListener('touchstart', (e) => { e.preventDefault(); set(true); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); set(false); });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); set(true); });
        btn.addEventListener('mouseup', (e) => { e.preventDefault(); set(false); });
    };

    bindTouch('d-left', 'left');
    bindTouch('d-right', 'right');
    bindTouch('d-up', 'up');
    bindTouch('d-down', 'down');
    
    // Touch Action (Canvas Tap)
    const canvas = document.getElementById('gameCanvas');
    if(canvas) {
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            input.action = true;
            // Immediate fire for invaders/paperboy to be responsive
            if(activeGame === 'invaders') { 
                // Fire logic needs to be reachable, simpler to rely on loop input check or global func
            }
        });
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); input.action = false; });
    }
});