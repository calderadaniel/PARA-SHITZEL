/* ================================================================
   VALENTINE TREE — script.js (VERSIÓN FINAL SIN ERRORES)
   Carga esta versión para que el clic funcione de inmediato.
================================================================ */

// 1. DEFINICIÓN DE EASES ESTÁNDAR (Sustituyen a CustomEase para evitar errores de licencia)
const organicEase = "power2.inOut"; 
const leafEase    = "back.out(1.5)";

// 2. REFERENCIAS DOM
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

// 3. TEXTO PERSONALIZADO
const MESSAGE = 
  'Para la persona que me hizo recordar\n' +
  'cómo se siente el amor:\n\n' +
  'Si me dieran a elegir el lugar\n' +
  'para estar el resto de mi vida,\n' +
  'sería abrazado a tu cuerpo,\n' +
  'viéndonos a los ojos\n' +
  'por toda la eternidad.';

// 4. CONFIGURACIÓN INICIAL
gsap.set([loveSig, ctrWrap, ctrDivider, ctrCaption, textOrn], { opacity: 0, y: 15 });
gsap.set(groundLine, { opacity: 0, scaleX: 0 });

// 5. FUNCIONES DEL SISTEMA
function initTreePaths() {
    const paths = document.querySelectorAll('#tree-svg path');
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
    const R  = Math.min(SW, SH) * 0.20;
    
    const palette = ['#d90429','#ef233c','#ff4d6d','#ff7090','#ffb3c1'];
    const layers = [{ count: 60, sMin: 0.8, sMax: 1.0 }, { count: 80, sMin: 0.4, sMax: 0.8 }, { count: 50, sMin: 0.1, sMax: 0.4 }];
    
    const allLeaves = [];
    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const t = Math.random() * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            const sc = layer.sMin + Math.random() * (layer.sMax - layer.sMin);
            const lx = cx + (hx/16) * sc * R + (Math.random()-0.5)*20;
            const ly = cy + (hy/13) * sc * R + (Math.random()-0.5)*20;
            
            const svg = document.createElementNS(svgNS, 'svg');
            const size = 10 + Math.random()*10;
            svg.setAttribute('width', size); svg.setAttribute('height', size);
            svg.setAttribute('viewBox', '0 0 20 20'); svg.classList.add('leaf');
            svg.style.left = lx + 'px'; svg.style.top = ly + 'px';
            
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', 'M10,1 C14,1 18,5 18,9.5 C18,14 15,18 10,19.5 C5,18 2,14 2,9.5 C2,5 6,1 10,1Z');
            path.setAttribute('fill', palette[Math.floor(Math.random()*palette.length)]);
            
            svg.appendChild(path);
            leavesLayer.appendChild(svg);
            allLeaves.push(svg);
        }
    });
    
    gsap.set(allLeaves, { scale: 0, opacity: 0 });
    gsap.to(allLeaves, { scale: 1, opacity: 1, rotate: () => Math.random()*360, duration: 0.6, ease: leafEase, stagger: 0.005 });
}

function typewriterEffect(onComplete) {
    loveText.innerHTML = "";
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
        setTimeout(tick, ch === '\n' ? 200 : 40);
    };
    tick();
}

function startCounter() {
    const LOVE_START = new Date(2021, 3, 12); // 12 de Abril 2021
    const now = new Date();
    let y = now.getFullYear() - LOVE_START.getFullYear();
    let m = now.getMonth() - LOVE_START.getMonth();
    let d = now.getDate() - LOVE_START.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    
    const animate = (id, val) => {
        const obj = { v: 0 };
        gsap.to(obj, { v: val, duration: 2, ease: "power2.out", onUpdate: () => {
            document.querySelector(`#${id} .cn`).textContent = Math.round(obj.v);
        }});
    };
    animate('cu-y', y); setTimeout(() => animate('cu-m', m), 300); setTimeout(() => animate('cu-d', d), 600);
}

// 6. LÓGICA DE ACTIVACIÓN
let started = false;
function runMasterTimeline() {
    if (started) return;
    started = true;
    
    heartSvg.style.animation = 'none';
    const master = gsap.timeline();

    master
    .to(tapHint, { opacity: 0, duration: 0.3 })
    .to(morphWrap, { scale: 1.2, duration: 0.2, ease: "back.out(2)" })
    .to(heartSvg, { opacity: 0, scale: 0, duration: 0.4 }, "+=0.1")
    .to(circleSvg, { opacity: 1, scale: 1, duration: 0.4 }, "<")
    .to(groundLine, { opacity: 1, scaleX: 1, duration: 0.6 })
    .to(morphWrap, { y: '55vh', duration: 0.6, ease: "power2.in" })
    .to(morphWrap, { scaleY: 0.4, scaleX: 1.6, transformOrigin: "50% 100%", duration: 0.15 })
    .to(morphWrap, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1, 0.3)" })
    .to(morphWrap, { opacity: 0, scale: 0, duration: 0.3 }, "+=0.3")
    .call(initTreePaths)
    .to(treeLayer, { opacity: 1, duration: 0.1 })
    .to('#tree-svg path', { strokeDashoffset: 0, duration: 2.5, stagger: 0.1, ease: organicEase })
    .to('.knot', { opacity: 1, duration: 0.5 })
    .call(generateLeaves)
    .to(['#tree-layer', '#leaves-layer'], { xPercent: 25, duration: 1.5, ease: "power3.inOut" }, "+=1")
    .to(textLayer, { opacity: 1, duration: 0.5 })
    .to(textOrn, { opacity: 1, y: 0, duration: 0.5 })
    .call(() => {
        typewriterEffect(() => {
            gsap.to([loveSig, ctrDivider, ctrWrap, ctrCaption], { opacity: 1, y: 0, stagger: 0.2 });
            startCounter();
        });
    });
}

// 7. EVENTOS DE CLIC (INFALIBLES)
morphWrap.addEventListener('click', runMasterTimeline);
morphWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runMasterTimeline();
}, { passive: false });
