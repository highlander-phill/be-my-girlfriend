document.addEventListener('DOMContentLoaded', () => {
    // --- UI INTERACTIONS ---
    const env = document.querySelector('.envelope-wrapper');
    const ppr = document.querySelector('.paper');
    const area = document.getElementById('actionArea');
    const no = document.getElementById('noBtn');

    env.addEventListener('click', () => {
        env.style.transform = 'translateY(-100vh) rotate(-20deg)';
        setTimeout(() => { env.classList.add('hidden'); ppr.classList.remove('hidden'); }, 600);
    });

    const moveNo = () => {
        no.style.left = Math.random() * (area.clientWidth - no.offsetWidth) + 'px';
        no.style.top = Math.random() * (area.clientHeight - no.offsetHeight) + 'px';
        no.style.transform = 'none';
    };
    no.addEventListener('mouseover', moveNo);
    no.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); });

    document.getElementById('yesBtn').addEventListener('click', () => {
        document.getElementById('celebration').style.display = 'block';
    });

    // --- GLOBAL INPUT ---
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

    ['up','down','left','right'].forEach(dir => {
        const btn = document.getElementById('d-'+dir);
        const code = {up:1, down:3, left:2, right:0}[dir];
        const handler = (e) => { e.preventDefault(); if(activeGame === 'pacman') pacNextDir = code; };
        btn.addEventListener('touchstart', handler);
        btn.addEventListener('mousedown', handler);
    });
});

let gameLoopId;
let activeGame = null;
let keys = {};
let pacNextDir = 0;

function resetToMenu() {
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    activeGame = null;
    document.getElementById('arcade-wrap').classList.add('hidden');
    document.getElementById('game-selection').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
}

function restartLevel() {
    if(activeGame) initGame(activeGame);
}

function initGame(type) {
    document.getElementById('game-selection').classList.add('hidden');
    document.getElementById('arcade-wrap').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('dpad').classList.add('hidden');

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    if(gameLoopId) cancelAnimationFrame(gameLoopId);
    activeGame = type;
    let score = 0;
    document.getElementById('score').innerText = '0';
    let frame = 0;
    let alive = true;

    // --- PAC-MAN ENGINE ---
    if (type === 'pacman') {
        canvas.width = 336; canvas.height = 380;
        document.getElementById('dpad').classList.remove('hidden');
        
        const TILE = 16;
        const map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,8,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,8,1],
            [1,0,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,9,9,9,1,1,0,1,1,1,1,1,1],
            [9,9,9,9,9,9,0,1,9,9,9,9,9,1,0,9,9,9,9,9,9],
            [1,1,1,1,1,1,0,1,9,9,9,9,9,1,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
            [1,8,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,8,1],
            [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
            [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        let player = { x: 10, y: 14, dir: 0 };
        let ghosts = [
            { x: 9, y: 8, color: 'red', dir: 1, vulnerable: false },
            { x: 10, y: 8, color: 'pink', dir: -1, vulnerable: false },
            { x: 11, y: 8, color: 'cyan', dir: 1, vulnerable: false }
        ];
        let powerTimer = 0;
        pacNextDir = 0;

        function pacLoop() {
            if(!alive) return;
            frame++;
            if(powerTimer > 0) powerTimer--;

            ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height);
            for(let y=0; y<map.length; y++) {
                for(let x=0; x<map[y].length; x++) {
                    if(map[y][x] === 1) {
                        ctx.fillStyle = '#1919A6'; ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
                    } else if(map[y][x] === 0) {
                        ctx.fillStyle = '#ffb8ae'; ctx.fillRect(x*TILE+6, y*TILE+6, 4, 4);
                    } else if(map[y][x] === 8) {
                        ctx.fillStyle = (frame % 20 < 10) ? '#ffb8ae' : '#000';
                        ctx.beginPath(); ctx.arc(x*TILE+8, y*TILE+8, 6, 0, Math.PI*2); ctx.fill();
                    }
                }
            }

            if(frame % 8 === 0) {
                let dx=0, dy=0;
                if(pacNextDir===0) dx=1; if(pacNextDir===1) dy=-1; if(pacNextDir===2) dx=-1; if(pacNextDir===3) dy=1;
                
                let nextX = player.x + dx; let nextY = player.y + dy;
                if(nextX < 0 || nextX >= map[0].length || map[nextY][nextX] !== 1) player.dir = pacNextDir;

                dx=0; dy=0;
                if(player.dir===0) dx=1; if(player.dir===1) dy=-1; if(player.dir===2) dx=-1; if(player.dir===3) dy=1;
                
                let destX = player.x + dx; let destY = player.y + dy;
                if (destX < 0) player.x = map[0].length - 1;
                else if (destX >= map[0].length) player.x = 0;
                else if (map[destY][destX] !== 1) { player.x = destX; player.y = destY; }

                let tile = map[player.y][player.x];
                if(tile === 0) { map[player.y][player.x] = 9; document.getElementById('score').innerText = (score += 10); }
                else if(tile === 8) { 
                    map[player.y][player.x] = 9; document.getElementById('score').innerText = (score += 50); 
                    powerTimer = 400; ghosts.forEach(g => g.vulnerable = true); 
                }
            }

            if(frame % 12 === 0) {
                ghosts.forEach(g => {
                    if(g.vulnerable && frame % 24 !== 0) return;
                    let dirs = [];
                    if(map[g.y-1] && map[g.y-1][g.x]!==1) dirs.push(1);
                    if(map[g.y+1] && map[g.y+1][g.x]!==1) dirs.push(3);
                    if(map[g.y][g.x-1]!==1) dirs.push(2);
                    if(map[g.y][g.x+1]!==1) dirs.push(0);
                    
                    if(dirs.length > 0) {
                        if (g.vulnerable) g.dir = dirs[Math.floor(Math.random()*dirs.length)];
                        else {
                             let bestDir = dirs[Math.floor(Math.random()*dirs.length)];
                             if(player.x > g.x && dirs.includes(0)) bestDir = 0;
                             if(player.x < g.x && dirs.includes(2)) bestDir = 2;
                             if(player.y > g.y && dirs.includes(3)) bestDir = 3;
                             if(player.y < g.y && dirs.includes(1)) bestDir = 1;
                             g.dir = bestDir;
                        }
                    }
                    if(g.dir===0) g.x++; if(g.dir===1) g.y--; if(g.dir===2) g.x--; if(g.dir===3) g.y++;
                    
                    if(g.x === player.x && g.y === player.y) {
                        if(g.vulnerable) { g.x = 10; g.y = 8; g.vulnerable = false; document.getElementById('score').innerText = (score += 200); }
                        else { alive = false; document.getElementById('game-over').classList.remove('hidden'); }
                    }
                });
            }
            if(powerTimer === 0) ghosts.forEach(g => g.vulnerable = false);

            ctx.fillStyle = 'yellow'; ctx.beginPath(); ctx.arc(player.x*TILE+8, player.y*TILE+8, 7, 0.2*Math.PI, 1.8*Math.PI); ctx.lineTo(player.x*TILE+8, player.y*TILE+8); ctx.fill();
            ghosts.forEach(g => {
                ctx.fillStyle = g.vulnerable ? (powerTimer < 100 && frame % 10 < 5 ? 'white' : 'blue') : g.color;
                ctx.beginPath(); ctx.arc(g.x*TILE+8, g.y*TILE+8, 7, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = 'white'; ctx.fillRect(g.x*TILE+4, g.y*TILE+4, 3, 3); ctx.fillRect(g.x*TILE+9, g.y*TILE+4, 3, 3);
            });
            gameLoopId = requestAnimationFrame(pacLoop);
        }
        pacLoop();

    // --- SPACE INVADERS ENGINE ---
    } else if (type === 'invaders') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 150, w: 40, h: 20 };
        let bullets = [];
        let invaders = [];
        let invDir = 1;
        
        for(let r=0; r<4; r++) for(let c=0; c<6; c++) invaders.push({ x: 30+c*45, y: 30+r*35, t: r===0?'🐙':'👾' });

        function fire() { bullets.push({ x: player.x+15, y: 400 }); }
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); fire(); });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); player.x = e.touches[0].clientX - canvas.getBoundingClientRect().left - 20; });
        window.addEventListener('keydown', (e) => { if(e.code==='Space' && alive && type==='invaders') fire(); });

        function invLoop() {
            if(!alive) return;
            frame++;
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
            
            if(invaders.length === 0) { document.getElementById('game-over').querySelector('h2').innerText = "YOU WIN!"; alive=false; document.getElementById('game-over').classList.remove('hidden'); }
            if(keys['ArrowLeft']) player.x -= 5;
            if(keys['ArrowRight']) player.x += 5;
            player.x = Math.max(0, Math.min(canvas.width-40, player.x));

            let hitEdge = false;
            if(frame % 2 === 0) {
                invaders.forEach(inv => {
                    inv.x += (2 * invDir);
                    if(inv.x > canvas.width - 30 || inv.x < 0) hitEdge = true;
                });
                if(hitEdge) { invDir *= -1; invaders.forEach(inv => inv.y += 10); }
            }

            ctx.font = '24px Arial';
            invaders.forEach(inv => {
                ctx.fillText(inv.t, inv.x, inv.y);
                if(inv.y > 380) { alive = false; document.getElementById('game-over').classList.remove('hidden'); }
            });

            bullets.forEach((b, i) => {
                b.y -= 7; ctx.fillText('❤️', b.x, b.y);
                invaders.forEach((inv, ii) => {
                    if(b.x > inv.x && b.x < inv.x+30 && b.y < inv.y && b.y > inv.y-20) {
                        invaders.splice(ii, 1); bullets.splice(i, 1);
                        document.getElementById('score').innerText = (score += 100);
                    }
                });
            });

            ctx.fillStyle = '#00ff00'; ctx.fillRect(player.x, 420, 40, 20); ctx.fillRect(player.x+15, 410, 10, 10);
            gameLoopId = requestAnimationFrame(invLoop);
        }
        invLoop();

    // --- PAPERBOY ENGINE (IMPROVED) ---
    } else if (type === 'paperboy') {
        canvas.width = 340; canvas.height = 450;
        let player = { x: 170, y: 350 };
        let world = []; let hearts = [];
        
        canvas.addEventListener('touchmove', e => { e.preventDefault(); player.x = e.touches[0].clientX - canvas.getBoundingClientRect().left - 20; }, {passive:false});
        canvas.addEventListener('touchstart', e => { e.preventDefault(); hearts.push({x: player.x+20, y: player.y, vx: -5, vy: -5}); }); // Throw LEFT
        window.addEventListener('keydown', (e) => { if(e.code==='Space' && alive && type==='paperboy') hearts.push({x: player.x+20, y: player.y, vx: -5, vy: -5}); });

        function pbLoop() {
            if(!alive) return;
            frame++;
            
            // Draw Grass
            ctx.fillStyle = '#2d5a27'; ctx.fillRect(0,0,340,450);
            
            // Draw Road (Wider, shifting perspective)
            ctx.fillStyle = '#555'; 
            ctx.beginPath(); 
            ctx.moveTo(100, 0); ctx.lineTo(340, 0); 
            ctx.lineTo(340, 450); ctx.lineTo(100, 450); 
            ctx.fill();
            
            // Sidewalk
            ctx.fillStyle = '#777';
            ctx.fillRect(80, 0, 20, 450);

            if(keys['ArrowLeft']) player.x -= 5;
            if(keys['ArrowRight']) player.x += 5;
            player.x = Math.max(100, Math.min(300, player.x)); // Stay on road

            // Spawn Logic: Varied positions on the LEFT lawn
            if(frame % 50 === 0) {
                let isHouse = Math.random() > 0.4;
                // Randomize X to be on the left lawn (0 to 60)
                let spawnX = Math.random() * 50; 
                world.push({x: spawnX, y: -50, t: isHouse ? '🏠' : '🚗', hit: false, isCar: !isHouse});
            }
            
            world.forEach((w, i) => {
                // Objects scroll down and slightly right to fake perspective
                w.y += 5; 
                w.x += 1.5; 

                // Cars spawn in road (override)
                if(w.isCar && w.y < 0) w.x = 200; 

                ctx.font = '40px Arial'; ctx.fillText(w.hit?'💖':w.t, w.x, w.y);
                
                // Collision with Player (Car)
                if(w.isCar && Math.hypot(player.x-w.x, player.y-w.y) < 30) { alive = false; document.getElementById('game-over').classList.remove('hidden'); }
                if(w.y > 500) world.splice(i, 1);
            });

            hearts.forEach((h, i) => {
                h.x += h.vx; h.y += h.vy; ctx.font = '20px Arial'; ctx.fillText('❤️', h.x, h.y);
                world.forEach(w => {
                    if(w.t==='🏠' && !w.hit && Math.hypot(h.x-w.x, h.y-w.y) < 40) { w.hit=true; document.getElementById('score').innerText = (score += 50); }
                });
            });

            ctx.font = '40px Arial'; ctx.fillText('🚲', player.x, player.y);
            gameLoopId = requestAnimationFrame(pbLoop);
        }
        pbLoop();
    }
}