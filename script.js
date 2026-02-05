document.addEventListener('DOMContentLoaded', () => {
    // UI ELEMENTS
    const envWrap = document.getElementById('envelope-wrap');
    const flap = document.getElementById('flap');
    const paper = document.getElementById('main-paper');
    const area = document.getElementById('actionArea');
    const no = document.getElementById('noBtn');
    
    // CONTRACT
    const termsModal = document.getElementById('terms-modal');
    const termsCheck = document.getElementById('terms-checkbox');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const dateSpan = document.getElementById('current-date');
    const celebration = document.getElementById('celebration');
    
    // STARTUP - ENSURE HIDDEN
    termsModal.classList.add('hidden');
    celebration.classList.add('hidden');
    if(dateSpan) dateSpan.innerText = new Date().toLocaleDateString();

    // 1. OPEN ENVELOPE
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

    // 2. NO BUTTON
    const moveNo = () => {
        no.style.left = Math.random() * (area.clientWidth - no.offsetWidth) + 'px';
        no.style.top = Math.random() * (area.clientHeight - no.offsetHeight) + 'px';
        no.style.transform = 'none';
    };
    no.addEventListener('mouseover', moveNo);
    no.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); });

    // 3. YES -> TERMS
    document.getElementById('yesBtn').addEventListener('click', () => {
        paper.style.transition = "transform 0.8s ease-in";
        paper.style.transform = "translateY(-150%) rotate(10deg)";
        setTimeout(() => {
            paper.classList.add('hidden');
            termsModal.classList.remove('hidden'); // SHOW MODAL
        }, 500);
    });

    // 4. TERMS -> GAME
    if(termsCheck) {
        termsCheck.addEventListener('change', (e) => {
            if(e.target.checked) acceptTermsBtn.classList.remove('disabled');
            else acceptTermsBtn.classList.add('disabled');
        });
    }
    if(acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', () => {
            termsModal.classList.add('hidden');
            celebration.classList.remove('hidden'); // SHOW GAME
        });
    }

    // --- INPUT ---
    window.addEventListener('keydown', (e) => {
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
        keys[e.code] = true;
        if(activeGame === 'pacman') {
            if(e.code === 'ArrowUp') pacNextDir = 1;
            if(e.code === 'ArrowDown') pacNextDir = 3;
            if(e.code === 'ArrowLeft') pacNextDir = 2;
            if(e.code === 'ArrowRight') pacNextDir = 0;
        }
    });
    window.addEventListener('keyup', (e) => keys[e.code] = false);

    // TOUCH HANDLERS
    ['up','down','left','right'].forEach(dir => {
        const btn = document.getElementById('d-'+dir);
        if(!btn) return;
        const pacCode = {up:1, down:3, left:2, right:0}[dir];
        
        const press = (e) => {
            e.preventDefault();
            if(dir === 'left') touchState.left = true;
            if(dir === 'right') touchState.right = true;
            if(dir === 'up') touchState.up = true;
            if(dir === 'down') touchState.down = true;
            if(activeGame === 'pacman') pacNextDir = pacCode; 
        };
        const release = (e) => { 
            e.preventDefault(); 
            if(dir === 'left') touchState.left = false;
            if(dir === 'right') touchState.right = false;
            if(dir === 'up') touchState.up = false;
            if(dir === 'down') touchState.down = false;
        };

        btn.addEventListener('touchstart', press);
        btn.addEventListener('touchend', release);
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
    });

    const jumpBtn = document.getElementById('jump-btn');
    if(jumpBtn) {
        const h = (s) => { touchState.jump = s; };
        jumpBtn.addEventListener('touchstart', (e)=>{e.preventDefault(); h(true);});
        jumpBtn.addEventListener('touchend', (e)=>{e.preventDefault(); h(false);});
        jumpBtn.addEventListener('mousedown', (e)=>{e.preventDefault(); h(true);});
        jumpBtn.addEventListener('mouseup', (e)=>{e.preventDefault(); h(false);});
    }
});

let gameLoopId;
let activeGame = null;
let keys = {};
let touchState = { left: false, right: false, up: false, down: false, jump: false };
let pacNextDir = 0;

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

    // --- MARIO ---
    if (type === 'mario') {
        canvas.width = 340; canvas.height = 400;
        document.getElementById('dpad').classList.remove('hidden'); 
        document.getElementById('jump-btn').classList.remove('hidden');
        
        let player = { x: 50, y: 300, w: 24, h: 24, vx: 0, vy: 0, grounded: false };
        const GRAVITY = 0.6, JUMP = -11, SPEED = 4;
        let items = [];
        
        // World
        for(let i=0; i<200; i+=40) items.push({x: i, y: 360, w: 40, h: 40, t: 'ground'}); 
        for(let i=300; i<2000; i+=40) {
            if(Math.random() > 0.2) items.push({x: i, y: 360, w: 40, h: 40, t: 'ground'});
            if(Math.random() > 0.7) {
                let h = 250 - Math.random()*50;
                items.push({x: i, y: h, w: 40, h: 40, t: 'brick'});
                if(Math.random()>0.5) items.push({x: i+10, y: h-30, w: 20, h: 20, t: 'heart'});
            }
            if(Math.random() > 0.9) items.push({x: i, y: 330, w: 20, h: 20, t: 'enemy', vx: -1});
        }

        function checkCol(p, b) {
            return (p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y);
        }

        function marioLoop() {
            if(!alive) return;
            frame++;
            
            // 1. Controls
            player.vx = 0;
            if(keys['ArrowRight'] || keys['KeyD'] || touchState.right) player.vx = SPEED;
            if(keys['ArrowLeft'] || keys['KeyA'] || touchState.left) player.vx = -SPEED;
            
            if((keys['Space'] || touchState.jump) && player.grounded) { 
                player.vy = JUMP; player.grounded = false; 
            }

            // 2. Physics X
            player.x += player.vx;
            if(player.x > 150) {
                let shift = player.x - 150;
                player.x = 150;
                items.forEach(i => i.x -= shift);
            }
            player.x = Math.max(0, player.x);

            items.forEach(b => {
                if((b.t === 'ground' || b.t === 'brick') && checkCol(player, b)) {
                    if(player.vx > 0) player.x = b.x - player.w;
                    else if(player.vx < 0) player.x = b.x + b.w;
                }
            });

            // 3. Physics Y
            player.vy += GRAVITY;
            player.y += player.vy;
            player.grounded = false;

            items.forEach(b => {
                if((b.t === 'ground' || b.t === 'brick') && checkCol(player, b)) {
                    if(player.vy > 0 && player.y < b.y) {
                        player.y = b.y - player.h; player.vy = 0; player.grounded = true;
                    } else if(player.vy < 0 && player.y > b.y) {
                        player.y = b.y + b.h; player.vy = 0;
                    }
                }
            });

            if(player.y > 400) { alive = false; document.getElementById('game-over').classList.remove('hidden'); }
            
            items.forEach((b, i) => {
                if(b.t === 'heart' && checkCol(player, b)) {
                    items.splice(i, 1);
                    document.getElementById('score').innerText = (score += 100);
                }
                if(b.t === 'enemy') {
                    b.x += b.vx;
                    if(checkCol(player, b)) {
                        alive = false; document.getElementById('game-over').classList.remove('hidden');
                    }
                }
            });

            // 5. Draw
            ctx.fillStyle = '#5c94fc'; ctx.fillRect(0,0,canvas.width,canvas.height);
            items.forEach(b => {
                if(b.x > -50 && b.x < 400) {
                    if(b.t==='ground') { ctx.fillStyle='#e52521'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.strokeRect(b.x,b.y,b.w,b.h); }
                    if(b.t==='brick') { ctx.fillStyle='#b84e00'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.strokeRect(b.x,b.y,b.w,b.h); }
                    if(b.t==='heart') { ctx.font='20px Arial'; ctx.fillText('❤️', b.x, b.y+20); }
                    if(b.t==='enemy') { ctx.font='20px Arial'; ctx.fillText('👾', b.x, b.y+20); }
                }
            });
            ctx.fillStyle = '#ff0000'; ctx.fillRect(player.x, player.y, player.w, player.h);
            ctx.fillStyle = '#0000ff'; ctx.fillRect(player.x, player.y+16, player.w, 8);
            
            gameLoopId = requestAnimationFrame(marioLoop);
        }
        marioLoop();

    // --- PAC-MAN ---
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
            ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let y=0; y<map.length; y++) for(let x=0; x<map[y].length; x++) {
                if(map[y][x]===1) { ctx.fillStyle='#1919A6'; ctx.fillRect(x*TILE, y*TILE, TILE, TILE); }
                else if(map[y][x]===0) { ctx.fillStyle='#ffb8ae'; ctx.beginPath(); ctx.arc(x*TILE+8,y*TILE+8, 4, 0, Math.PI*2); ctx.fill(); }
                else if(map[y][x]===8) { ctx.fillStyle=(frame%20<10)?'#ffb8ae':'#000'; ctx.beginPath(); ctx.arc(x*TILE+8,y*TILE+8,6,0,Math.PI*2); ctx.fill(); }
            }
            let moveRate = Math.max(5, 12 - Math.floor(score/200)); 
            if(frame % moveRate === 0) {
                let dx=0, dy=0; if(pacNextDir===0) dx=1; if(pacNextDir===1) dy=-1; if(pacNextDir===2) dx=-1; if(pacNextDir===3) dy=1;
                let nextX=player.x+dx, nextY=player.y+dy;
                if(nextX<0) nextX=map[0].length-1; if(nextX>=map[0].length) nextX=0; if(nextY<0) nextY=map.length-1; if(nextY>=map.length) nextY=0;
                if(map[nextY][nextX]!==1) player.dir=pacNextDir;
                dx=0; dy=0; if(player.dir===0) dx=1; if(player.dir===1) dy=-1; if(player.dir===2) dx=-1; if(player.dir===3) dy=1;
                let destX=player.x+dx, destY=player.y+dy;
                if(destX<0) player.x=map[0].length-1; else if(destX>=map[0].length) player.x=0; else if(destY<0) player.y=map.length-1; else if(destY>=map.length) player.y=0; else if(map[destY][destX]!==1) { player.x=destX; player.y=destY; }
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
            
            ctx.save();
            ctx.translate(player.x*TILE+8, player.y*TILE+8);
            if(player.dir === 1) ctx.rotate(-Math.PI/2); 
            if(player.dir === 2) ctx.rotate(Math.PI);    
            if(player.dir === 3) ctx.rotate(Math.PI/2); 
            ctx.fillStyle='yellow'; ctx.beginPath(); ctx.arc(0, 0, 7, 0.2*Math.PI, 1.8*Math.PI); ctx.lineTo(0,0); ctx.fill();
            ctx.restore();

            ghosts.forEach(g => { ctx.fillStyle=g.vulnerable?(powerTimer<100 && frame%10<5?'white':'blue'):g.color; ctx.beginPath(); ctx.arc(g.x*TILE+8,g.y*TILE+8,7,0,Math.PI*2); ctx.fill(); ctx.fillStyle='white'; ctx.fillRect(g.x*TILE+4,g.y*TILE+4,3,3); ctx.fillRect(g.x*TILE+9,g.y*TILE+4,3,3); });
            gameLoopId = requestAnimationFrame(pacLoop);
        }
        pacLoop();

    // --- INVADERS ---
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
            if(keys['ArrowLeft'] || keys['KeyA'] || touchState.left) player.x-=5; 
            if(keys['ArrowRight'] || keys['KeyD'] || touchState.right) player.x+=5; 
            player.x=Math.max(0,Math.min(canvas.width-40,player.x));

            if(frame%4===0) { let hitEdge=false; invaders.forEach(inv=>{inv.x+=(2*invDir); if(inv.x>canvas.width-30 || inv.x<0) hitEdge=true;}); if(hitEdge) { invDir*=-1; invaders.forEach(inv=>inv.y+=10); } }
            ctx.fillStyle='red'; ctx.font='24px Arial'; invaders.forEach(inv=>{ctx.fillText(inv.t,inv.x,inv.y); if(inv.y>380) {alive=false; document.getElementById('game-over').classList.remove('hidden');}});
            bullets.forEach((b,i)=>{b.y-=7; ctx.fillText('❤️',b.x,b.y); invaders.forEach((inv,ii)=>{if(b.x>inv.x && b.x<inv.x+30 && b.y<inv.y && b.y>inv.y-20) {invaders.splice(ii,1); bullets.splice(i,1); document.getElementById('score').innerText=(score+=100);}});});
            ctx.fillStyle='#00ff00'; ctx.fillRect(player.x,420,40,20); ctx.fillRect(player.x+15,410,10,10);
            if(invaders.length===0) { document.getElementById('game-over').querySelector('h2').innerText="YOU WIN!"; alive=false; document.getElementById('game-over').classList.remove('hidden'); }
            gameLoopId=requestAnimationFrame(invLoop);
        }
        invLoop();

    // --- PAPERBOY ---
    } else if (type === 'paperboy') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 170, y: 350 }, world = [], hearts = [];
        canvas.addEventListener('touchmove', e=>{e.preventDefault();player.x=e.touches[0].clientX-canvas.getBoundingClientRect().left-20;}, {passive:false}); canvas.addEventListener('touchstart', e=>{e.preventDefault();hearts.push({x:player.x+20,y:player.y,vx:-5,vy:-5});}); window.addEventListener('keydown', e=>{if(e.code==='Space'&&alive&&type==='paperboy')hearts.push({x:player.x+20,y:player.y,vx:-5,vy:-5});});
        function pbLoop() {
            if(!alive) return; frame++;
            ctx.fillStyle='#2d5a27'; ctx.fillRect(0,0,340,450); ctx.fillStyle='#555'; ctx.beginPath(); ctx.moveTo(100,0); ctx.lineTo(340,0); ctx.lineTo(340,450); ctx.lineTo(100,450); ctx.fill(); ctx.fillStyle='#777'; ctx.fillRect(80,0,20,450);
            if(keys['ArrowLeft'] || keys['KeyA'] || touchState.left) player.x-=5; 
            if(keys['ArrowRight'] || keys['KeyD'] || touchState.right) player.x+=5; 
            player.x=Math.max(100,Math.min(300,player.x));
            if(frame%40===0) { 
                let isHouse=Math.random()>0.4; 
                let spawnX = isHouse ? (Math.random() * 60) : (120 + Math.random() * 200); 
                world.push({x:spawnX, y:-50, t:isHouse?'🏠':'🚗', hit:false, isCar:!isHouse, speed: 4+Math.random()*2}); 
            }
            world.forEach((w,i)=>{
                w.y+=w.speed; if(w.isCar && w.y<0) w.x=Math.max(120, Math.min(300, w.x)); 
                ctx.font='40px Arial'; ctx.fillText(w.hit?'💖':w.t,w.x,w.y); 
                if(w.isCar && Math.hypot(player.x-w.x,player.y-w.y)<30) {alive=false; document.getElementById('game-over').classList.remove('hidden');} if(w.y>500) world.splice(i,1);
            });
            hearts.forEach((h,i)=>{h.x+=h.vx; h.y+=h.vy; ctx.font='20px Arial'; ctx.fillText('❤️',h.x,h.y); world.forEach(w=>{if(w.t==='🏠'&&!w.hit&&Math.hypot(h.x-w.x,h.y-w.y)<40){w.hit=true;document.getElementById('score').innerText=(score+=50);}});});
            ctx.font='40px Arial'; ctx.fillText('🚲',player.x,player.y);
            gameLoopId=requestAnimationFrame(pbLoop);
        }
        pbLoop();
    }
}