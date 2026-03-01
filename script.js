/* ================================================================
   VALENTINE TREE — script.js (CORREGIDO)
================================================================ */

// 0. REGISTRAR PLUGINS
gsap.registerPlugin(CustomEase);

CustomEase.create('organicGrow', 'M0,0 C0.06,0 0.20,0.45 0.28,0.58 0.38,0.74 0.55,0.95 0.65,0.99 0.82,1.01 1,1');
CustomEase.create('leafBurst', 'M0,0 C0.22,-0.26 0.28,1.10 0.5,1.05 0.72,1.0 0.86,1.0 1,1');

// 1. REFERENCIAS DOM
const introLayer  = document.getElementById('intro-layer');
const morphWrap   = document.getElementById('morph-wrap');
const heartSvg    = document.getElementById('heart-svg');
const circleSvg   = document.getElementById('circle-svg');
const tapHint     = document.getElementById('tap-hint');
const groundLine  = document.getElementById('ground-line');
const treeLayer   = document.getElementById('tree-layer');
const leavesLayer = document.getElementById('leaves-layer');
const textLayer   = document.getElementById('text-layer');
const loveText    = document.getElementById('love-text');
const loveSig     = document.getElementById('love-sig');
const ctrWrap     = document.getElementById('counter-wrap');
const ctrDivider  = document.getElementById('counter-divider');
const ctrCaption  = document.getElementById('counter-caption');
const textOrn     = document.getElementById('text-ornament');

// 2. TEXTO PERSONALIZADO (TU DEDICATORIA)
const MESSAGE = 
  'Para la persona que me hizo recordar\n' +
  'cómo se siente el amor:\n\n' +
  'Si me dieran a elegir el lugar\n' +
  'para estar el resto de mi vida,\n' +
  'sería abrazado a tu cuerpo,\n' +
  'viéndonos a los ojos\n' +
  'por toda la eternidad.';

// 3. ESTADO INICIAL
gsap.set([loveSig, ctrWrap, ctrDivider, ctrCaption], { opacity: 0, y: 12 });
gsap.set(textOrn, { opacity: 0, y: 8 });

// 4. FUNCIONES DE APOYO (Init Paths, Leaves, Counter, etc.)
function initTreePaths() {
    const paths = document.querySelectorAll('#tree-svg .root, #tree-svg .trunk-shadow, #tree-svg .trunk, #tree-svg .branch');
    paths.forEach(el => {
        try {
            const len = el.getTotalLength();
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        } catch (e) {}
    });
    gsap.set('.knot', { opacity: 0 });
}

function generateLeaves() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const SW = window.innerWidth;
    const SH = window.innerHeight;
    const cx = SW * 0.50;
    const cy = SH * 0.30;
    const R  = Math.min(SW, SH) * 0.195;
    const palette = ['#b50016','#c8001c','#d90429','#e4102e','#ef233c','#f03858','#ff4d6d','#ff7090','#ffb3c1','#ffc8d0'];
    const weights = [6,8,10,10,9,7,5,4,3,2];
    const pool = [];
    palette.forEach((c, i) => { for (let w = 0; w < weights[i]; w++) pool.push(c); });
    const layers = [{ count: 65, sMin: 0.88, sMax: 1.02 }, { count: 95, sMin: 0.44, sMax: 0.87 }, { count: 70, sMin: 0.08, sMax: 0.43 }];
    const allLeaves = [];
    let idx = 0;
    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const t = (i / layer.count) * Math.PI * 2 + idx * 0.618033;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            const nx = hx / 16; const ny = hy / 13;
            const sc = layer.sMin + Math.random() * (layer.sMax - layer.sMin);
            const lx = cx + (nx + (Math.random()-0.5)*0.14) * sc * R;
            const ly = cy + (ny + (Math.random()-0.5)*0.14) * sc * R * 0.96;
            const size = 9 + Math.random() * 13;
            const color = pool[Math.floor(Math.random() * pool.length)];
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', size); svg.setAttribute('height', size);
            svg.setAttribute('viewBox', '0 0 20 20'); svg.classList.add('leaf');
            svg.style.left = lx + 'px'; svg.style.top = ly + 'px';
            svg.style.marginLeft = -(size/2) + 'px'; svg.style.marginTop = -(size/2) + 'px';
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', 'M10,1 C14,1 18,5 18,9.5 C18,14 15,18 10,19.5 C5,18 2,14 2,9.5 C2,5 6,1 10,1Z');
            path.setAttribute('fill', color); path.setAttribute('opacity', 0.85);
            svg.appendChild(path);
            leavesLayer.appendChild(svg);
            allLeaves.push({ el: svg, dist: Math.hypot(lx - cx, ly - cy) });
            idx++;
        }
    });
    allLeaves.sort((a, b) => a.dist - b.dist);
    const sorted = allLeaves.map(l => l.el);
    gsap.set(sorted, { scale: 0, opacity: 0 });
    gsap.to(sorted, { scale: 1, opacity: 1, rotate: () => Math.random() * 360, duration: 0.6, ease: 'leafBurst', stagger: 0.01 });
}

function typewriterEffect(onComplete) {
    loveText.classList.add('typing');
    const chars = MESSAGE.split('');
    let i = 0;
    const tick = () => {
        if (i >= chars.length) {
            loveText.classList.remove('typing');
            if (onComplete) onComplete();
            return;
        }
        const ch = chars[i++];
        loveText.innerHTML += (ch === '\n') ? '<br>' : ch;
        setTimeout(tick, ch === '\n' ? 150 : 40);
    };
    tick();
}

function startCounter() {
    const LOVE_START = new Date(2021, 3, 12);
    const now = new Date();
    let y = now.getFullYear() - LOVE_START.getFullYear();
    let m = now.getMonth() - LOVE_START.getMonth();
    let d = now.getDate() - LOVE_START.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    
    const animate = (id, val) => {
        const obj = { v: 0 };
        gsap.to(obj, { v: val, duration: 2, ease: 'power2.out', onUpdate: () => {
            document.querySelector(`#${id} .cn`).textContent = Math.round(obj.v);
        }});
    };
    animate('cu-y', y); setTimeout(() => animate('cu-m', m), 300); setTimeout(() => animate('cu-d', d), 600);
}

// 5. TIMELINE MAESTRA
let started = false;
function runMasterTimeline() {
    if (started) return;
    started = true;
    heartSvg.style.animation = 'none'; // Detener latido CSS

    const master = gsap.timeline();
    master
    .to(tapHint, { opacity: 0, duration: 0.3 })
    .to(morphWrap, { scale: 1.2, duration: 0.2, ease: 'power2.out' })
    .to(heartSvg, { opacity: 0, scale: 0.8, duration: 0.5 }, "+=0.1")
    .to(circleSvg, { opacity: 1, scale: 1, duration: 0.5 }, "<")
    .to(groundLine, { opacity: 1, scaleX: 1, duration: 0.6 }, "+=0.2")
    .to(morphWrap, { y: '55vh', duration: 0.6, ease: 'power2.in' })
    // Squash & Stretch
    .to(morphWrap, { scaleY: 0.4, scaleX: 1.5, transformOrigin: '50% 100%', duration: 0.15 })
    .to(morphWrap, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
    .to(morphWrap, { opacity: 0, scale: 0, duration: 0.4 }, "+=0.3")
    // Árbol
    .call(initTreePaths)
    .to(treeLayer, { opacity: 1, duration: 0.1 })
    .to('.trunk, .branch, .root', { strokeDashoffset: 0, duration: 3, stagger: 0.1, ease: 'organicGrow' })
    .to('.knot', { opacity: 1, duration: 0.5 })
    .call(generateLeaves)
    // Movimiento y Texto
    .to(['#tree-layer', '#leaves-layer'], { xPercent: 25, duration: 1.5, ease: 'power3.inOut' }, "+=1")
    .to(textLayer, { opacity: 1, duration: 0.5 })
    .to(textOrn, { opacity: 1, y: 0, duration: 0.5 })
    .call(() => {
        typewriterEffect(() => {
            gsap.to([loveSig, ctrDivider, ctrWrap, ctrCaption], { opacity: 1, y: 0, stagger: 0.2 });
            startCounter();
        });
    });
}

// 6. EL DISPARADOR (EVENT LISTENER)
// Esta es la parte que faltaba para que el clic funcionara
morphWrap.addEventListener('click', runMasterTimeline);
morphWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runMasterTimeline();
});
