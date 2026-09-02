// ==================================================
// GLOBAL ENGINE & STATE
// ==================================================
const STATE = {
    chapter: 1,
    canvasW: window.innerWidth,
    canvasH: window.innerHeight,
    particles: [],
    fireworksActive: false
};

const canvas = document.getElementById('cosmic-canvas');
const ctx = canvas.getContext('2d');
canvas.width = STATE.canvasW;
canvas.height = STATE.canvasH;

window.addEventListener('resize', () => {
    STATE.canvasW = window.innerWidth;
    STATE.canvasH = window.innerHeight;
    canvas.width = STATE.canvasW;
    canvas.height = STATE.canvasH;
});

// Utility: Random Range
const rand = (min, max) => Math.random() * (max - min) + min;

// ==================================================
// PARTICLE & FIREWORKS ENGINE
// ==================================================
class Particle {
    constructor(x, y, type = 'star', color = '#ffffff') {
        this.x = x; this.y = y; this.type = type; this.color = color;
        if (type === 'star') {
            this.vx = rand(-0.2, 0.2); this.vy = rand(-0.2, 0.2);
            this.size = rand(0.5, 2); this.life = 100; this.decay = 0;
        } else if (type === 'firework') {
            this.vx = rand(-8, 8); this.vy = rand(-8, 8);
            this.size = rand(1, 4); this.life = 1; this.decay = rand(0.01, 0.03);
            this.gravity = 0.15;
        } else if (type === 'portal') {
            const angle = Math.atan2(y - STATE.canvasH/2, x - STATE.canvasW/2);
            this.vx = Math.cos(angle) * rand(2, 10);
            this.vy = Math.sin(angle) * rand(2, 10);
            this.size = rand(2, 6); this.life = 1; this.decay = 0.02;
        }
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.type === 'firework') this.vy += this.gravity;
        if (this.type !== 'star') this.life -= this.decay;
        
        // Wrap stars
        if (this.type === 'star') {
            if (this.x < 0) this.x = STATE.canvasW; if (this.x > STATE.canvasW) this.x = 0;
            if (this.y < 0) this.y = STATE.canvasH; if (this.y > STATE.canvasH) this.y = 0;
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = (this.type === 'star') ? this.color : `${this.color}${Math.floor(this.life*255).toString(16).padStart(2,'0')}`;
        ctx.fill();
    }
}

// Init Background Stars
for(let i=0; i<150; i++) STATE.particles.push(new Particle(rand(0, STATE.canvasW), rand(0, STATE.canvasH), 'star', '#ffffff'));

function launchFirework(x, y) {
    const colors = ['#F72585', '#7209B7', '#FFD700', '#ffffff', '#4CC9F0'];
    const color = colors[Math.floor(rand(0, colors.length))];
    for(let i=0; i<60; i++) STATE.particles.push(new Particle(x, y, 'firework', color));
}

function renderCanvas() {
    ctx.clearRect(0, 0, STATE.canvasW, STATE.canvasH);
    if(STATE.fireworksActive && Math.random() < 0.05) launchFirework(rand(100, STATE.canvasW-100), rand(100, STATE.canvasH/2));
    
    for(let i = STATE.particles.length - 1; i >= 0; i--) {
        const p = STATE.particles[i];
        p.update(); p.draw(ctx);
        if(p.type !== 'star' && p.life <= 0) STATE.particles.splice(i, 1);
    }
    requestAnimationFrame(renderCanvas);
}
renderCanvas();

// ==================================================
// TRANSITION SYSTEM
// ==================================================
function transitionChapter(toChapter, effectClass, duration = 1500) {
    const overlay = document.getElementById('transition-overlay');
    if(effectClass === 't-zoom') {
        // Custom Portal Zoom logic
        const ring = document.querySelector('.ring-1');
        ring.style.transition = "transform 2s, opacity 1s";
        ring.style.transform = "scale(50)";
        ring.style.opacity = "0";
        overlay.style.background = "transparent";
    } else {
        overlay.className = '';
        overlay.classList.add(effectClass);
    }
    
    setTimeout(() => {
        document.querySelectorAll('.chapter').forEach(c => c.classList.remove('active'));
        document.getElementById(`chapter-${toChapter}`).classList.add('active');
        STATE.chapter = toChapter;
        
        // Setup Specific Chapter Logic
        if(toChapter === 2) setupGamesOrbit();
        if(toChapter === 3) startMemorySequence();
        if(toChapter === 4) STATE.fireworksActive = false; // Reset just in case
    }, duration / 2);

    setTimeout(() => {
        overlay.className = '';
        overlay.style.opacity = '0';
    }, duration);
}

// ==================================================
// CHAPTER 1: THE PORTAL
// ==================================================
document.getElementById('intro-star').addEventListener('click', () => {
    document.getElementById('intro-sequence').classList.add('hidden');
    document.getElementById('portal-sequence').classList.remove('hidden');
});

document.getElementById('btn-enter-portal').addEventListener('click', () => {
    // Portal explosion particles
    for(let i=0; i<100; i++) STATE.particles.push(new Particle(STATE.canvasW/2, STATE.canvasH/2, 'portal', '#7209B7'));
    
    document.getElementById('btn-enter-portal').style.opacity = 0;
    
    // Zoom transition simulation
    transitionChapter(1, 't-zoom', 2000); 
    
    setTimeout(() => {
        document.getElementById('portal-sequence').classList.add('hidden');
        document.getElementById('reveal-sequence').classList.remove('hidden');
        
        // Sequence Reveal
        setTimeout(() => document.querySelector('.reveal-story').classList.remove('hidden'), 2500);
        setTimeout(() => document.querySelector('.reveal-name').classList.remove('hidden'), 5000);
        setTimeout(() => document.querySelector('.age-reveal').classList.remove('hidden'), 8000);
        
        // Age Transform
        setTimeout(() => {
            document.querySelector('.age-old').classList.add('hidden');
            document.querySelector('.age-new').classList.remove('hidden');
            launchFirework(STATE.canvasW/2, STATE.canvasH/2);
            launchFirework(STATE.canvasW/2 - 100, STATE.canvasH/2 + 50);
            launchFirework(STATE.canvasW/2 + 100, STATE.canvasH/2 + 50);
        }, 10000);

        setTimeout(() => document.querySelector('.age-next').classList.remove('hidden'), 12500);
        setTimeout(() => document.getElementById('btn-ch2').classList.remove('hidden'), 14000);
    }, 1000);
});

document.getElementById('btn-ch2').addEventListener('click', () => transitionChapter(2, 't-dissolve'));

// ==================================================
// CHAPTER 2: THE PLAYGROUND (GAMES)
// ==================================================
const gameNodes = document.querySelectorAll('.game-node');
const gameContainer = document.getElementById('game-container');
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('game-score');
let currentGameLoop = null;
let score = 0;

function setupGamesOrbit() {
    // Re-trigger animations if needed
}

gameNodes.forEach(node => {
    node.addEventListener('click', () => {
        const gameType = node.getAttribute('data-game');
        document.getElementById('game-menu').classList.add('hidden');
        document.querySelector('.playground-header').classList.add('hidden');
        document.getElementById('btn-ch3').classList.add('hidden');
        gameContainer.classList.remove('hidden');
        startGame(gameType);
    });
});

document.getElementById('btn-exit-game').addEventListener('click', () => {
    clearInterval(currentGameLoop);
    gameArea.innerHTML = '';
    gameContainer.classList.add('hidden');
    document.getElementById('game-menu').classList.remove('hidden');
    document.querySelector('.playground-header').classList.remove('hidden');
    document.getElementById('btn-ch3').classList.remove('hidden');
});

document.getElementById('btn-ch3').addEventListener('click', () => transitionChapter(3, 't-dissolve'));

function updateScore(pts) {
    score += pts;
    scoreEl.innerText = `SCORE: ${score}`;
    launchFirework(rand(0, STATE.canvasW), rand(0, STATE.canvasH/2));
}

function startGame(type) {
    gameArea.innerHTML = '';
    score = 0; updateScore(0);
    
    // MICRO-GAME IMPLEMENTATIONS
    if(type === 'balloon') {
        currentGameLoop = setInterval(() => {
            const b = document.createElement('div'); b.className = 'game-obj neon-balloon';
            b.style.left = `${rand(10, 90)}%`; b.style.bottom = '-60px';
            b.onclick = () => { updateScore(10); b.remove(); };
            gameArea.appendChild(b);
            let pos = -60;
            const fly = setInterval(() => { pos+=2; b.style.bottom=`${pos}px`; if(pos>gameArea.clientHeight){clearInterval(fly);b.remove();} }, 16);
            b.dataset.fly = fly;
        }, 800);
    } 
    else if(type === 'gravity') {
        const basket = document.createElement('div'); basket.className = 'grav-basket';
        gameArea.appendChild(basket);
        gameArea.onmousemove = (e) => { const rect = gameArea.getBoundingClientRect(); basket.style.left = `${e.clientX - rect.left - 40}px`; };
        gameArea.ontouchmove = (e) => { const rect = gameArea.getBoundingClientRect(); basket.style.left = `${e.touches[0].clientX - rect.left - 40}px`; };
        
        currentGameLoop = setInterval(() => {
            const h = document.createElement('div'); h.className = 'game-obj grav-heart';
            h.style.left = `${rand(10, 90)}%`; h.style.top = '-30px';
            gameArea.appendChild(h);
            let pos = -30;
            const drop = setInterval(() => {
                pos+=3; h.style.top=`${pos}px`;
                const hRect = h.getBoundingClientRect(), bRect = basket.getBoundingClientRect();
                if(hRect.bottom >= bRect.top && hRect.right >= bRect.left && hRect.left <= bRect.right) { updateScore(5); clearInterval(drop); h.remove(); }
                else if(pos>gameArea.clientHeight){clearInterval(drop);h.remove();}
            }, 16);
        }, 1000);
    }
    else if(type === 'memory') {
        const grid = document.createElement('div'); grid.className = 'memory-grid';
        const symbols = ['✧','✦','★','☆','✧','✦','★','☆'];
        symbols.sort(() => Math.random() - 0.5);
        let flipped = [], matched = 0;
        symbols.forEach(sym => {
            const card = document.createElement('div'); card.className = 'mem-card';
            card.innerHTML = `<span class="front">${sym}</span>`;
            card.onclick = () => {
                if(flipped.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped'); flipped.push(card);
                    if(flipped.length === 2) {
                        setTimeout(() => {
                            if(flipped[0].innerText === flipped[1].innerText) { matched+=2; updateScore(50); }
                            else { flipped[0].classList.remove('flipped'); flipped[1].classList.remove('flipped'); }
                            flipped = [];
                            if(matched === 8) setTimeout(()=> { gameArea.innerHTML='<h2 class="neon-text">HACKED!</h2>'; launchFirework(STATE.canvasW/2, STATE.canvasH/2); }, 500);
                        }, 800);
                    }
                }
            };
            grid.appendChild(card);
        });
        gameArea.appendChild(grid);
    }
    else if(type === 'cake') {
        gameArea.innerHTML = `<div class="cake-builder"><div class="cb-tier tier-1">LAYER 1</div><div class="cb-tier tier-2">LAYER 2</div><div class="cb-tier tier-3">LAYER 3</div><button class="cyber-btn" style="margin-top:20px;" onclick="document.querySelectorAll('.cb-tier').forEach(t=>t.classList.add('filled')); updateScore(100); launchFirework(${STATE.canvasW/2}, ${STATE.canvasH/2});">ASSEMBLE CAKE</button></div>`;
    }
    else if(type === 'bubble') {
        currentGameLoop = setInterval(() => {
            const b = document.createElement('div'); b.className = 'game-obj dim-bubble';
            b.style.left = `${rand(10, 90)}%`; b.style.top = `${rand(10, 90)}%`;
            b.onclick = () => { b.style.transform='scale(3)'; b.style.opacity='0'; updateScore(10); setTimeout(()=>b.remove(),200); };
            gameArea.appendChild(b);
            setTimeout(() => {if(b.parentNode)b.remove();}, 1500);
        }, 600);
    }
    else if(type === 'runner') {
        const p = document.createElement('div'); p.className = 'runner-player';
        gameArea.appendChild(p);
        gameArea.onclick = () => { p.classList.add('jump'); setTimeout(()=>p.classList.remove('jump'), 500); };
        currentGameLoop = setInterval(() => {
            const o = document.createElement('div'); o.className = 'runner-obs'; gameArea.appendChild(o);
            let pos = -50;
            const move = setInterval(() => {
                pos+=5; o.style.right = `${pos}px`;
                const oRect=o.getBoundingClientRect(), pRect=p.getBoundingClientRect();
                if(oRect.left<pRect.right && oRect.right>pRect.left && pRect.bottom>oRect.top) { /* Hit */ o.remove(); clearInterval(move); }
                else if(oRect.right<pRect.left && !o.passed) { o.passed=true; updateScore(20); }
                if(pos>gameArea.clientWidth){clearInterval(move);o.remove();}
            }, 16);
        }, 1500);
    }
    else if(type === 'sky') {
        const s = document.createElement('div'); s.className = 'sky-obj';
        let bPos = 50; s.style.bottom = `${bPos}px`;
        gameArea.appendChild(s);
        gameArea.onclick = () => { bPos+=30; s.style.bottom=`${bPos}px`; updateScore(5); if(bPos>gameArea.clientHeight-50){ gameArea.innerHTML='<h2 class="neon-text">ESCAPED!</h2>'; launchFirework(STATE.canvasW/2, STATE.canvasH/2); } };
        currentGameLoop = setInterval(() => { bPos-=2; s.style.bottom=`${bPos}px`; if(bPos<0) bPos=0; }, 20);
    }
    else if(type === 'box') {
        const box = document.createElement('div'); box.className = 'game-obj mystery-box';
        gameArea.appendChild(box);
        box.onclick = () => {
            box.style.transform = 'scale(1.5) rotate(720deg)';
            box.style.opacity = '0';
            setTimeout(() => {
                gameArea.innerHTML = '<h2 class="neon-text">SURPRISE!</h2><p class="montserrat">Bonus 1000 Pts!</p>';
                updateScore(1000);
                for(let i=0; i<5; i++) setTimeout(()=>launchFirework(rand(0,STATE.canvasW), rand(0,STATE.canvasH)), i*200);
            }, 500);
        };
    }
}

// ==================================================
// CHAPTER 3: MEMORY DIMENSION
// ==================================================
function startMemorySequence() {
    const t1 = document.querySelector('.m-text-1');
    const t2 = document.querySelector('.m-text-2');
    const t3 = document.querySelector('.m-text-3');
    const p1 = document.getElementById('photo-1');
    const p2 = document.getElementById('photo-2');
    const btn = document.getElementById('btn-ch4');

    setTimeout(() => { t1.classList.add('hidden'); t2.classList.remove('hidden'); }, 3000);
    setTimeout(() => { p1.classList.remove('hidden'); }, 4000);
    setTimeout(() => { t2.classList.add('hidden'); t3.classList.remove('hidden'); }, 7000);
    setTimeout(() => { p2.classList.remove('hidden'); setTimeout(()=>p2.classList.add('formed'), 100); }, 8000);
    setTimeout(() => { btn.classList.remove('hidden'); }, 11000);

    // Interactions
    p1.addEventListener('click', () => { p1.classList.toggle('zoom'); p2.style.opacity = p1.classList.contains('zoom') ? '0':'1'; });
    p2.addEventListener('click', () => { p2.classList.toggle('zoom'); p1.style.opacity = p2.classList.contains('zoom') ? '0':'1'; });
}

document.getElementById('btn-ch4').addEventListener('click', () => transitionChapter(4, 't-dissolve'));

// ==================================================
// CHAPTER 4: CELEBRATION
// ==================================================
const btnBlow = document.getElementById('btn-blow');
const btnCut = document.getElementById('btn-cut');
const grandCake = document.getElementById('grand-cake');

btnBlow.addEventListener('click', () => {
    document.querySelectorAll('.flame').forEach(f => f.classList.add('out'));
    document.querySelectorAll('.candle').forEach(c => c.classList.add('blown'));
    btnBlow.classList.add('hidden');
    
    // Subtle smoke effect via fireworks engine
    for(let i=0; i<30; i++) STATE.particles.push(new Particle(STATE.canvasW/2, STATE.canvasH/2 - 100, 'portal', '#ffffff'));
    
    setTimeout(() => btnCut.classList.remove('hidden'), 1500);
});

btnCut.addEventListener('click', () => {
    btnCut.classList.add('hidden');
    grandCake.classList.add('cut-active'); // Drops the cut line
    
    setTimeout(() => {
        grandCake.classList.add('cake-sliced'); // Splits the cake
        
        // Massive explosion
        for(let i=0; i<10; i++) launchFirework(STATE.canvasW/2, STATE.canvasH/2);
        
        document.getElementById('celebration-title').innerText = "THE CELEBRATION HAS BEGUN";
        document.getElementById('celebration-title').classList.add('neon-text');
        STATE.fireworksActive = true; // Auto fireworks loop
        
        setTimeout(() => document.getElementById('btn-ch5').classList.remove('hidden'), 3000);
    }, 500);
});

document.getElementById('btn-ch5').addEventListener('click', () => transitionChapter(5, 't-flash', 1000));

// ==================================================
// CHAPTER 5: FINAL UNIVERSE
// ==================================================
const orb = document.getElementById('orb-container');
const letterCont = document.getElementById('letter-container');
const letterContent = document.getElementById('letter-content');
const btnFinale = document.getElementById('btn-finale');

const messageLines = [
    "Dear Aarushi,",
    "Today is more than just a birthday.",
    "It is the beginning of another beautiful chapter.",
    "May this new year of your life bring you happiness, unforgettable memories, and endless reasons to smile.",
    "May every dream find its way to you.",
    "Keep shining.",
    "Keep smiling.",
    "And keep being beautifully you.",
    "<span class='highlight'>Happy 21st Birthday, Aarushi. 💖</span>"
];

orb.addEventListener('click', () => {
    orb.style.opacity = '0';
    launchFirework(STATE.canvasW/2, STATE.canvasH/2);
    
    setTimeout(() => {
        orb.classList.add('hidden');
        letterCont.classList.remove('hidden');
        
        // Line-by-line reveal
        messageLines.forEach((line, index) => {
            const p = document.createElement('p');
            p.innerHTML = line;
            letterContent.appendChild(p);
            setTimeout(() => p.classList.add('visible'), 1000 + (index * 1500));
        });

        setTimeout(() => btnFinale.classList.remove('hidden'), 1000 + (messageLines.length * 1500));
    }, 500);
});

btnFinale.addEventListener('click', () => {
    letterCont.classList.add('hidden');
    document.getElementById('countdown-container').classList.remove('hidden');
    
    const num = document.getElementById('cd-num');
    setTimeout(() => num.classList.remove('hidden'), 2000);
    setTimeout(() => num.innerText = '2', 3000);
    setTimeout(() => num.innerText = '1', 4000);
    
    setTimeout(() => {
        // Ultimate Explosion
        document.getElementById('countdown-container').classList.add('hidden');
        document.getElementById('ultimate-reveal').classList.remove('hidden');
        
        // Overdrive Fireworks
        STATE.fireworksActive = true;
        const overdrive = setInterval(() => launchFirework(rand(100, STATE.canvasW-100), rand(100, STATE.canvasH)), 200);
        setTimeout(() => clearInterval(overdrive), 5000);

    }, 5000);
});

// Initialization
window.onload = () => {
    // Ensuring the system starts cleanly
    console.log("Welcome to the 21st Universe.");
};