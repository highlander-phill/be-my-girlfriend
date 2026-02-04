document.addEventListener('DOMContentLoaded', () => {
    // --- UI ELEMENTS ---
    const envWrap = document.getElementById('envelope-wrap');
    const paper = document.getElementById('main-paper');
    const area = document.getElementById('actionArea');
    const no = document.getElementById('noBtn');
    
    // Text Steps
    const nextBtn = document.getElementById('nextBtn');
    const step1 = document.getElementById('text-step-1');
    const step2 = document.getElementById('text-step-2');
    
    // Terms & Contract
    const termsModal = document.getElementById('terms-modal');
    const termsCheck = document.getElementById('terms-checkbox');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const dateSpan = document.getElementById('current-date');
    
    // Set Date on Contract
    if(dateSpan) dateSpan.innerText = new Date().toLocaleDateString();

    // 1. ENVELOPE ANIMATION SEQUENCE
    envWrap.addEventListener('click', () => {
        if(envWrap.classList.contains('open')) return;
        
        // Open Flap
        envWrap.classList.add('open');
        
        // Wait, then fly envelope away and show paper
        setTimeout(() => {
            envWrap.classList.add('fly-away');
            setTimeout(() => {
                envWrap.classList.add('hidden');
                paper.classList.remove('hidden');
            }, 600);
        }, 800);
    });

    // 2. TEXT REVEAL (Step 1 -> Step 2)
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        });
    }

    // 3. NO BUTTON EVASION
    const moveNo = () => {
        no.style.left = Math.random() * (area.clientWidth - no.offsetWidth) + 'px';
        no.style.top = Math.random() * (area.clientHeight - no.offsetHeight) + 'px';
        no.style.transform = 'none';
    };
    no.addEventListener('mouseover', moveNo);
    no.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); });

    // 4. YES CLICKED -> HIDE PAPER -> SHOW TERMS
    document.getElementById('yesBtn').addEventListener('click', () => {
        // Fancy fly-away effect for the note
        paper.style.transition = "transform 0.8s ease-in";
        paper.style.transform = "translateY(-150%) rotate(10deg)";
        
        setTimeout(() => {
            paper.classList.add('hidden');
            if(termsModal) termsModal.classList.remove('hidden'); 
            else document.getElementById('celebration').style.display = 'block';
        }, 500);
    });

    // 5. TERMS & CONDITIONS LOGIC
    if(termsCheck) {
        termsCheck.addEventListener('change', (e) => {
            if(e.target.checked) acceptTermsBtn.classList.remove('disabled');
            else acceptTermsBtn.classList.add('disabled');
        });
    }
    if(acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', () => {
            termsModal.classList.add('hidden');
            document.getElementById('celebration').style.display = 'block';
        });
    }

    // --- GLOBAL INPUT HANDLING ---
    window.addEventListener('keydown', (e) => {
        // Prevent default scrolling for game keys
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
        
        keys[e.code] = true;
        
        // Pac-Man Buffer
        if(activeGame === 'pacman') {
            if(e.code === 'ArrowUp') pacNextDir = 1;
            if(e.code === 'ArrowDown') pacNextDir = 3;
            if(e.code === 'ArrowLeft') pacNextDir = 2;
            if(e.code === 'ArrowRight') pacNextDir = 0;
        }
    });
    
    window.addEventListener('keyup', (e) => keys[e.code] = false);

    // Touch / D-Pad Handling
    ['up','down','left','right'].forEach(dir => {
        const btn = document.getElementById('d-'+dir);
        const code = {up:1, down:3, left:2, right:0}[dir];
        const keyMap = {up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight'};
        
        if(btn) { 
            const handler = (e) => { 
                e.preventDefault(); 
                keys[keyMap[dir]] = true; 
                if(activeGame === 'pacman') pacNextDir = code; 
            };
            btn.addEventListener('touchstart', handler);
            btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyMap[dir]] = false; });
            btn.addEventListener('mousedown', handler);
            btn.addEventListener('mouseup', (e) => { e.preventDefault(); keys[keyMap[dir]] = false; });
        }
    });

    // Jump Button Handling
    const jumpBtn = document.getElementById('jump-btn');
    if(jumpBtn) {
        jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['Space'] = true; });
        jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['Space'] = false; });
        jumpBtn.addEventListener('mousedown', (e) => { e.preventDefault(); keys['Space'] = true; });
        jumpBtn.addEventListener('mouseup', (e) => { e.preventDefault(); keys['Space'] = false; });
    }
});

// --- GAME STATE VARIABLES ---
let gameLoopId;
let activeGame = null;
let keys = {};
let pacNextDir = 0;

// --- GLOBAL GAME FUNCTIONS ---
function resetToMenu() {
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    activeGame = null;
    document.getElementById('arcade-wrap').classList.add('hidden');
    document.getElementById('game-selection').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('jump-btn').classList.add('hidden');
    document.getElementById('dpad').classList.add('hidden');
}

function restartLevel() {
    if(activeGame) initGame(activeGame);
}

function initGame(type) {
    // UI Reset
    document.getElementById('game-selection').classList.add('hidden');
    document.getElementById('arcade-wrap').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('dpad').classList.add('hidden');
    document.getElementById('jump-btn').classList.add('hidden');

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    activeGame = type;
    let score = 0;
    document.getElementById('score').innerText = '0';
    let frame = 0;
    let alive = true;

    // ==========================================
    // GAME 1: SUPER PHILLIO BROS (MARIO)
    // ==========================================
    if (type === 'mario') {
        canvas.width = 340; canvas.height = 400;
        document.getElementById('dpad').classList.remove('hidden'); 
        document.getElementById('jump-btn').classList.remove('hidden');
        
        let player = { x: 50, y: 300, w: 20, h: 30, vx: 0, vy: 0, grounded: false };
        const GRAVITY = 0.6;
        const JUMP = -11;
        const SPEED = 4;
        let blocks = []; let hearts = []; let enemies = [];
        
        // Initial Floor
        for(let i=0; i<100; i++) blocks.push({x: i*40, y: 360, w: 40, h: 40, type: 'ground'});
        
        // Procedural Generation
        for(let i=5; i<100; i+= Math.floor(Math.random()*4)+3) {
            let h = 200 + Math.random()*100;
            blocks.push({x: i*40, y: h, w: 40, h: 40, type: 'brick'});
            if(Math.random() > 0.5) blocks.push({x: (i+1)*40, y: h, w: 40, h: 40, type: 'question'});
            else if(Math.random() > 0.7) enemies.push({x: (i+2)*40, y: 330, w: 20, h: 20, vx: -1});
        }

        function rectIntersect(r1, r2) { 
            return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y); 
        }

        function marioLoop() {
            if(!alive) return;
            frame++;
            
            // Movement (WASD + Arrows)
            if(keys['ArrowRight'] || keys['KeyD']) player.vx = SPEED;
            else if(keys['ArrowLeft'] || keys['KeyA']) player.vx = -SPEED;
            else player.vx = 0;

            if(keys['Space'] && player.grounded) { player.vy = JUMP; player.grounded = false; }
            
            player.x += player.vx;
            
            // FIX: Prevent walking off left edge
            player.x = Math.max(0, player.x);

            // Scrolling Logic (Right Side)
            if(player.x > 150) {
                let shift = player.x - 150;
                player.x = 150;
                blocks.forEach(b => b.x -= shift);
                hearts.forEach(h => h.x -= shift);
                enemies.forEach(e => e.x -= shift);
                
                // Infinite Level Gen
                if(blocks[blocks.length-1].x < 340) {
                    blocks.push({x: blocks[blocks.length-1].x+40, y: 360, w: 40, h: 40, type: 'ground'});
                }
            }

            // X Collisions
            blocks.forEach(b => {
                if(rectIntersect(player, b)) {
                    if(player.vx > 0) player.x = b.x - player.w;
                    else if(player.vx < 0) player.x = b.x + b.w;
                }
            });

            // Gravity
            player.vy += GRAVITY; 
            player.y += player.vy; 
            player.grounded = false;

            // Y Collisions
            blocks.forEach(b => {
                if(rectIntersect(player, b)) {
                    if(player.vy > 0 && player.y + player.h < b.y + b.h) { 
                        player.y = b.y - player.h; player.vy = 0; player.grounded = true; 
                    }
                    else if(player.vy < 0 && player.y > b.y) { 
                        player.y = b.y + b.h; player.vy = 0; 
                        if(b.type === 'question') { 
                            b.type = 'box'; hearts.push({x: b.x + 10, y: b.y - 30, w: 20, h: 20}); 
                        }
                    }
                }
            });

            if(player.y > 400) { alive = false; document.getElementById('game-over').classList.remove('hidden'); }
            
            // Item & Enemy Interaction
            hearts.forEach((h, i) => { if(rectIntersect(player, h)) { hearts.splice(i, 1); document.getElementById('score').innerText = (score += 100); } });
            enemies.forEach(e => {
                e.x += e.vx;
                if(rectIntersect(player, e)) { alive = false; document.getElementById('game-over').classList.remove('hidden'); }
            });
            
            // Draw
            ctx.fillStyle = '#5c94fc'; ctx.fillRect(0,0,canvas.width,canvas.height); // Sky
            blocks.forEach(b => {
                if(b.type === 'ground') { ctx.fillStyle = '#e52521'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle='#000'; ctx.strokeRect(b.x,b.y,b.w,b.h); }
                if(b.type === 'brick') { ctx.fillStyle = '#b84e00'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.strokeRect(b.x,b.y,b.w,b.h); }
                if(b.type === 'question') { ctx.fillStyle = '#ffd500'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle='#000'; ctx.fillText('?', b.x+12, b.y+28); }
                if(b.type === 'box') { ctx.fillStyle = '#9e6800'; ctx.fillRect(b.x, b.y, b.w, b.h); }
            });
            ctx.font = '20px Arial'; hearts.forEach(h => ctx.fillText('❤️', h.x, h.y + 20));
            enemies.forEach(e => ctx.fillText('👾', e.x, e.y + 20));
            
            // Draw Player
            ctx.fillStyle = '#ff0000'; ctx.fillRect(player.x, player.y, player.w, player.h); 
            ctx.fillStyle = '#0000ff'; ctx.fillRect(player.x, player.y+20, player.w, 10);
            
            gameLoopId = requestAnimationFrame(marioLoop);
        }
        marioLoop();

    // ==========================================
    // GAME 2: PAC-KRYSTLE (PAC-MAN)
    // ==========================================
    } else if (type === 'pacman') {
        canvas.width = 336; canvas.height = 380;
        document.getElementById('dpad').classList.remove('hidden');
        const TILE = 16;
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
        let ghosts = [ { x: 9, y: 8, color: 'red', dir: 1, vulnerable: false }, { x: 10, y: 8, color: 'pink', dir: -1, vulnerable: false }, { x: 11, y: 8, color: 'cyan', dir: 1, vulnerable: false } ];
        let powerTimer = 0; pacNextDir = 0;

        function pacLoop() {
            if(!alive) return;
            frame++;
            if(powerTimer > 0) powerTimer--;
            
            // Draw Map
            ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let y=0; y<map.length; y++) for(let x=0; x<map[y].length; x++) {
                if(map[y][x]===1) { ctx.fillStyle='#1919A6'; ctx.fillRect(x*TILE, y*TILE, TILE, TILE); }
                else if(map[y][x]===0) { ctx.fillStyle='#ffb8ae'; ctx.fillRect(x*TILE+6, y*TILE+6, 4, 4); }
                else if(map[y][x]===8) { ctx.fillStyle=(frame%20<10)?'#ffb8ae':'#000'; ctx.beginPath(); ctx.arc(x*TILE+8,y*TILE+8,6,0,Math.PI*2); ctx.fill(); }
            }

            let moveRate = Math.max(5, 12 - Math.floor(score/200)); 
            
            if(frame % moveRate === 0) {
                let dx=0, dy=0; 
                if(pacNextDir===0) dx=1; if(pacNextDir===1) dy=-1; if(pacNextDir===2) dx=-1; if(pacNextDir===3) dy=1;
                
                let nextX=player.x+dx, nextY=player.y+dy;
                if(nextX<0) nextX=map[0].length-1; if(nextX>=map[0].length) nextX=0; if(nextY<0) nextY=map.length-1; if(nextY>=map.length) nextY=0;
                
                if(map[nextY][nextX]!==1) player.dir=pacNextDir;
                dx=0; dy=0; if(player.dir===0) dx=1; if(player.dir===1) dy=-1; if(player.dir===2) dx=-1; if(player.dir===3) dy=1;
                
                let destX=player.x+dx, destY=player.y+dy;
                if(destX<0) player.x=map[0].length-1; 
                else if(destX>=map[0].length) player.x=0; 
                else if(destY<0) player.y=map.length-1; 
                else if(destY>=map.length) player.y=0; 
                else if(map[destY][destX]!==1) { player.x=destX; player.y=destY; }
                
                let tile=map[player.y][player.x];
                if(tile===0) { map[player.y][player.x]=9; document.getElementById('score').innerText=(score+=10); }
                else if(tile===8) { map[player.y][player.x]=9; document.getElementById('score').innerText=(score+=50); powerTimer=400; ghosts.forEach(g=>g.vulnerable=true); }
            }

            if(frame % (moveRate + 4) === 0) {
                ghosts.forEach(g => {
                    if(g.vulnerable && frame % ((moveRate+4)*2) !== 0) return;
                    let dirs=[], upY=g.y-1<0?map.length-1:g.y-1, downY=g.y+1>=map.length?0:g.y+1, leftX=g.x-1<0?map[0].length-1:g.x-1, rightX=g.x+1>=map[0].length?0:g.x+1;
                    if(map[upY][g.x]!==1) dirs.push(1); if(map[downY][g.x]!==1) dirs.push(3); if(map[g.y][leftX]!==1) dirs.push(2); if(map[g.y][rightX]!==1) dirs.push(0);
                    
                    if(dirs.length>0) g.dir = g.vulnerable ? dirs[Math.floor(Math.random()*dirs.length)] : dirs[Math.floor(Math.random()*dirs.length)]; 
                    
                    if(g.dir===0) g.x++; if(g.dir===1) g.y--; if(g.dir===2) g.x--; if(g.dir===3) g.y++;
                    if(g.x<0) g.x=map[0].length-1; if(g.x>=map[0].length) g.x=0; if(g.y<0) g.y=map.length-1; if(g.y>=map.length) g.y=0;
                    
                    if(g.x===player.x && g.y===player.y) {
                        if(g.vulnerable) { g.x=10; g.y=8; g.vulnerable=false; document.getElementById('score').innerText=(score+=200); }
                        else { alive=false; document.getElementById('game-over').classList.remove('hidden'); }
                    }
                });
            }
            if(powerTimer===0) ghosts.forEach(g=>g.vulnerable=false);
            
            ctx.fillStyle='yellow'; ctx.beginPath(); ctx.arc(player.x*TILE+8, player.y*TILE+8, 7, 0.2*Math.PI, 1.8*Math.PI); ctx.lineTo(player.x*TILE+8, player.y*TILE+8); ctx.fill();
            ghosts.forEach(g => { ctx.fillStyle=g.vulnerable?(powerTimer<100 && frame%10<5?'white':'blue'):g.color; ctx.beginPath(); ctx.arc(g.x*TILE+8,g.y*TILE+8,7,0,Math.PI*2); ctx.fill(); ctx.fillStyle='white'; ctx.fillRect(g.x*TILE+4,g.y*TILE+4,3,3); ctx.fillRect(g.x*TILE+9,g.y*TILE+4,3,3); });
            gameLoopId = requestAnimationFrame(pacLoop);
        }
        pacLoop();

    // ==========================================
    // GAME 3: SPACE INVADERS
    // ==========================================
    } else if (type === 'invaders') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 150, w: 40, h: 20 }, bullets = [], invaders = [], invDir = 1;
        for(let r=0; r<4; r++) for(let c=0; c<6; c++) invaders.push({ x: 30+c*45, y: 30+r*35, t: r===0?'🐙':'👾' });

        function fire() { bullets.push({ x: player.x+15, y: 400 }); }
        
        canvas.addEventListener('touchstart', (e)=>{e.preventDefault();fire();}); 
        canvas.addEventListener('touchmove', (e)=>{e.preventDefault();player.x=e.touches[0].clientX-canvas.getBoundingClientRect().left-20;}); 
        window.addEventListener('keydown', (e)=>{if(e.code==='Space'&&alive&&type==='invaders')fire();});

        function invLoop() {
            if(!alive) return; frame++;
            ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            
            if(keys['ArrowLeft'] || keys['KeyA']) player.x-=5; 
            if(keys['ArrowRight'] || keys['KeyD']) player.x+=5; 
            player.x=Math.max(0,Math.min(canvas.width-40,player.x));

            if(frame%4===0) { 
                let hitEdge=false; 
                invaders.forEach(inv=>{inv.x+=(2*invDir); if(inv.x>canvas.width-30 || inv.x<0) hitEdge=true;}); 
                if(hitEdge) { invDir*=-1; invaders.forEach(inv=>inv.y+=10); } 
            }

            ctx.font='24px Arial'; 
            invaders.forEach(inv=>{ctx.fillText(inv.t,inv.x,inv.y); if(inv.y>380) {alive=false; document.getElementById('game-over').classList.remove('hidden');}});
            
            bullets.forEach((b,i)=>{
                b.y-=7; ctx.fillText('❤️',b.x,b.y); 
                invaders.forEach((inv,ii)=>{
                    if(b.x>inv.x && b.x<inv.x+30 && b.y<inv.y && b.y>inv.y-20) {
                        invaders.splice(ii,1); bullets.splice(i,1); document.getElementById('score').innerText=(score+=100);
                    }
                });
            });

            ctx.fillStyle='#00ff00'; ctx.fillRect(player.x,420,40,20); ctx.fillRect(player.x+15,410,10,10);
            
            if(invaders.length===0) { document.getElementById('game-over').querySelector('h2').innerText="YOU WIN!"; alive=false; document.getElementById('game-over').classList.remove('hidden'); }
            
            gameLoopId=requestAnimationFrame(invLoop);
        }
        invLoop();
    
    // ==========================================
    // GAME 4: PAPERBOY (RANDOMIZED)
    // ==========================================
    } else if (type === 'paperboy') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 170, y: 350 }, world = [], hearts = [];
        
        canvas.addEventListener('touchmove', e=>{e.preventDefault();player.x=e.touches[0].clientX-canvas.getBoundingClientRect().left-20;}, {passive:false}); 
        canvas.addEventListener('touchstart', e=>{e.preventDefault();hearts.push({x:player.x+20,y:player.y,vx:-5,vy:-5});}); 
        window.addEventListener('keydown', e=>{if(e.code==='Space'&&alive&&type==='paperboy')hearts.push({x:player.x+20,y:player.y,vx:-5,vy:-5});});

        function pbLoop() {
            if(!alive) return; frame++;
            
            ctx.fillStyle='#2d5a27'; ctx.fillRect(0,0,340,450); 
            ctx.fillStyle='#555'; ctx.beginPath(); ctx.moveTo(100,0); ctx.lineTo(340,0); ctx.lineTo(340,450); ctx.lineTo(100,450); ctx.fill(); 
            ctx.fillStyle='#777'; ctx.fillRect(80,0,20,450);

            if(keys['ArrowLeft'] || keys['KeyA']) player.x-=5; 
            if(keys['ArrowRight'] || keys['KeyD']) player.x+=5; 
            player.x=Math.max(100,Math.min(300,player.x));

            // Spawn Logic
            let spawnRate = Math.max(30, 60 - Math.floor(score/300));
            if(frame % spawnRate === 0) {
                let isHouse = Math.random() > 0.4;
                let obj = { y: -50, hit: false, isCar: !isHouse, speed: 4 + Math.random()*2, driftX: 1 + Math.random() };
                
                if(isHouse) {
                    obj.t = '🏠'; obj.x = Math.random() * 60; 
                } else {
                    obj.t = '🚗';
                    let lane = Math.random();
                    if(lane < 0.33) obj.x = 120; else if(lane < 0.66) obj.x = 200; else obj.x = 280;
                }
                world.push(obj);
            }
            
            world.forEach((w,i)=>{
                w.y += w.speed; w.x += w.driftX; 
                ctx.font='40px Arial'; ctx.fillText(w.hit?'💖':w.t,w.x,w.y);
                if(w.isCar && Math.hypot(player.x-w.x, player.y-w.y)<30) { alive=false; document.getElementById('game-over').classList.remove('hidden'); }
                if(w.y > 500) world.splice(i,1);
            });

            hearts.forEach((h,i)=>{
                h.x+=h.vx; h.y+=h.vy; 
                ctx.font='20px Arial'; ctx.fillText('❤️',h.x,h.y); 
                world.forEach(w=>{if(!w.isCar && !w.hit && Math.hypot(h.x-w.x,h.y-w.y)<40){w.hit=true;document.getElementById('score').innerText=(score+=50);}});
            });

            ctx.font='40px Arial'; ctx.fillText('🚲',player.x,player.y);
            gameLoopId=requestAnimationFrame(pbLoop);
        }
        pbLoop();
    }
}