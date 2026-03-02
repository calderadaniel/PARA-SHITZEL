/* ================================================================
   VALENTINE TREE — script.js (COMPLETO Y CORREGIDO)
================================================================ */

/* ── 0. CUSTOM EASES ── */
gsap.registerPlugin(CustomEase);

CustomEase.create('organicGrow',
  'M0,0 C0.06,0 0.20,0.45 0.28,0.58 0.38,0.74 0.55,0.95 0.65,0.99 0.82,1.01 1,1');
CustomEase.create('leafBurst',
  'M0,0 C0.22,-0.26 0.28,1.10 0.5,1.05 0.72,1.0 0.86,1.0 1,1');

/* ── 1. REFERENCIAS DOM ── */
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

/* ── 2. ESTADO INICIAL DE TEXTO ── */
gsap.set([loveSig, ctrWrap, ctrDivider, ctrCaption], { opacity: 0, y: 12 });
gsap.set(textOrn, { opacity: 0, y: 8 });

/* ── 3. INICIALIZAR STROKE-DASHOFFSET ── */
function initTreePaths() {
  const paths = document.querySelectorAll(
    '#tree-svg .root, #tree-svg .trunk-shadow, #tree-svg .trunk, #tree-svg .branch'
  );
  paths.forEach(el => {
    try {
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    } catch (e) { /* ignorar elipses */ }
  });
  gsap.set('.knot', { opacity: 0 });
}

/* ── 4. GENERADOR DE PÉTALOS ── */
function generateLeaves() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const SW = window.innerWidth;
  const SH = window.innerHeight;

  const cx = SW * 0.50;
  const cy = SH * 0.30;
  const R  = Math.min(SW, SH) * 0.195;

  const palette = ['#b50016','#c8001c','#d90429','#e4102e',
                   '#ef233c','#f03858','#ff4d6d','#ff7090',
                   '#ffb3c1','#ffc8d0'];
  const weights  = [6,8,10,10,9,7,5,4,3,2];
  const pool = [];
  palette.forEach((c, i) => { for (let w = 0; w < weights[i]; w++) pool.push(c); });

  const layers = [
    { count: 55, sMin: 0.88, sMax: 1.02 },
    { count: 85, sMin: 0.44, sMax: 0.87 },
    { count: 60, sMin: 0.08, sMax: 0.43 },
  ];

  const allLeaves = [];
  let idx = 0;

  layers.forEach(layer => {
    for (let i = 0; i < layer.count; i++) {
      const t = (i / layer.count) * Math.PI * 2 + idx * 0.618033;
      const hx =  16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      const nx = hx / 16;
      const ny = hy / 13;

      const sc  = layer.sMin + Math.random() * (layer.sMax - layer.sMin);
      const nx2 = nx + (Math.random() - 0.5) * 0.14;
      const ny2 = ny + (Math.random() - 0.5) * 0.14;

      const lx = cx + nx2 * sc * R;
      const ly = cy + ny2 * sc * R * 0.96;

      const size = 9 + Math.random() * 13 + (1 - sc) * 4;
      const color = pool[Math.floor(Math.random() * pool.length)];
      const alpha = 0.72 + Math.random() * 0.28;
      const dist  = Math.hypot(lx - cx, ly - cy);

      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width',   size);
      svg.setAttribute('height',  size);
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.classList.add('leaf');
      svg.style.left       = lx + 'px';
      svg.style.top        = ly + 'px';
      svg.style.marginLeft = -(size / 2) + 'px';
      svg.style.marginTop  = -(size / 2) + 'px';

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d',
        'M10,1 C14,1 18,5 18,9.5 C18,14 15,18 10,19.5 C5,18 2,14 2,9.5 C2,5 6,1 10,1Z'
      );
      path.setAttribute('fill',     color);
      path.setAttribute('opacity', alpha);

      const shine = document.createElementNS(svgNS, 'ellipse');
      shine.setAttribute('cx', '8'); shine.setAttribute('cy', '7');
      shine.setAttribute('rx', '3'); shine.setAttribute('ry', '2');
      shine.setAttribute('fill', 'white'); shine.setAttribute('opacity', '0.20');
      shine.setAttribute('transform', 'rotate(-20,8,7)');

      svg.appendChild(path);
      svg.appendChild(shine);
      leavesLayer.appendChild(svg);

      svg.dataset.dist = dist;
      allLeaves.push({ el: svg, dist });
      idx++;
    }
  });

  allLeaves.sort((a, b) => a.dist - b.dist);
  const sorted = allLeaves.map(l => l.el);

  gsap.set(sorted, { scale: 0, opacity: 0 });
  gsap.to(sorted, {
    scale:    1,
    opacity:  1,
    rotate:   () => Math.random() * 360,
    duration: 0.52,
    ease:     'leafBurst',
    stagger:  { each: 0.010, from: 'start' },
  });
}

/* ── 5. TYPEWRITER CON TU TEXTO ── */
const MESSAGE =
  'Para la persona que me hizo recordar\n' +
  'cómo se siente el amor:\n\n' +
  'Si me dieran a elegir el lugar\n' +
  'para estar el resto de mi vida,\n' +
  'sería abrazado a tu cuerpo,\n' +
  'viéndonos a los ojos\n' +
  'por toda la eternidad.';

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
    setTimeout(tick, ch === '\n' ? 110 : 36);
  };
  tick();
}

/* ── 6. CONTADOR DESDE 12-04-2021 ── */
const LOVE_START = new Date(2021, 3, 12);

function getTimeDiff() {
  const now = new Date();
  let y = now.getFullYear() - LOVE_START.getFullYear();
  let m = now.getMonth()    - LOVE_START.getMonth();
  let d = now.getDate()     - LOVE_START.getDate();
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}

function animateCounterNum(id, target) {
  const el  = document.querySelector(`#${id} .cn`);
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target, duration: 1.6, ease: 'power2.out',
    onUpdate()  { el.textContent = Math.round(obj.v); },
    onComplete(){ el.textContent = target; },
  });
}

function startCounter() {
  const { y, m, d } = getTimeDiff();
  animateCounterNum('cu-y', y);
  setTimeout(() => animateCounterNum('cu-m', m), 300);
  setTimeout(() => animateCounterNum('cu-d', d), 550);
}

/* ── 7. CAÍDA DE HOJAS EN ZIG-ZAG ── */
function dropLeaves() {
  const all = Array.from(document.querySelectorAll('.leaf'));
  if (!all.length) return;
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const chosen = all.slice(0, 20);
  const SH = window.innerHeight;

  chosen.forEach((leaf, i) => {
    const startY  = parseFloat(leaf.style.top);
    const fallDist = SH - startY + 80;
    const swingAmp = 20 + Math.random() * 40;
    const dur      = 2.8 + Math.random() * 2.2;
    const delay    = i * 0.16 + Math.random() * 0.4;

    const tl = gsap.timeline({ delay });
    tl.to(leaf, { y: fallDist, duration: dur, ease: 'power1.in' }, 0);
    tl.to(leaf, { x: `+=${swingAmp}`, rotation: '+=' + (80 + Math.random() * 200), duration: dur / 4, ease: 'sine.inOut', repeat: 3, yoyo: true }, 0);
    tl.to(leaf, { opacity: 0, duration: 0.85, ease: 'power2.in' }, dur - 0.85);
  });
}

/* ════════════════════════════════════════════════════════════
   8. TIMELINE MAESTRA ORIGINAL (CORREGIDA Y CERRADA)
════════════════════════════════════════════════════════════ */
let started = false;

function runMasterTimeline() {
  if (started) return;
  started = true;

  heartSvg.style.animation = 'none';
  const master = gsap.timeline();

  master
    .to(tapHint, { opacity: 0, duration: 0.2 }, 0)
    .to(morphWrap, { scale: 1.15, duration: 0.18, ease: 'power2.out' }, 0.05)
    .to(morphWrap, { scale: 1.02, duration: 0.14, ease: 'power2.in'  }, 0.23)
    .to(heartSvg, { opacity: 0, scale: 0.82, duration: 0.5, ease: 'power2.inOut' }, 0.4)
    .to(circleSvg, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.inOut' }, 0.4)
    .to(morphWrap, { scaleY: 1.18, scaleX: 0.88, duration: 0.2, ease: 'power1.in' }, 0.92)
    .to(groundLine, { opacity: 1, scaleX: 1, transformOrigin: 'center', duration: 0.6, ease: 'power2.out' }, 1.0)
    .to(morphWrap, { y: '55vh', scaleY: 1.0, scaleX: 1.0, duration: 0.55, ease: 'power2.in' }, 1.12)
    .to(morphWrap, { scaleY: 0.38, scaleX: 1.60, transformOrigin: '50% 100%', duration: 0.10, ease: 'power4.out' }, 1.67)
    .to(morphWrap, { scaleY: 1.40, scaleX: 0.74, y: '42vh', duration: 0.22, ease: 'power2.out' }, 1.77)
    .to(morphWrap, { scaleY: 0.62, scaleX: 1.24, y: '55vh', transformOrigin: '50% 100%', duration: 0.14, ease: 'power2.in' }, 1.99)
    .to(morphWrap, { scaleY: 1.10, scaleX: 0.93, y: '50vh', duration: 0.14, ease: 'power2.out' }, 2.13)
    .to(morphWrap, { scaleY: 1.0, scaleX: 1.0, y: '55vh', duration: 0.20, ease: 'elastic.out(1, 0.5)' }, 2.27)
    .to({}, { duration: 0.25 }, 2.5)
    .to(morphWrap, { scaleY: 0, scaleX: 1.5, opacity: 0, duration: 0.38, ease: 'power3.in' }, 2.75)
    .set(introLayer, { visibility: 'hidden' }, 3.2)
    .call(initTreePaths, null, 3.15)
    .to(treeLayer, { opacity: 1, duration: 0.01 }, 3.15)
    .to(['#root-l1', '#root-r1'], { strokeDashoffset: 0, duration: 0.55, ease: 'power1.out', stagger: 0.08 }, 3.25)
    .to(['#root-l2', '#root-r2', '#root-c'], { strokeDashoffset: 0, duration: 0.45, ease: 'power1.out', stagger: 0.07 }, 3.52)
    .to('#trunk-shad', { strokeDashoffset: 0, duration: 1.0, ease: 'organicGrow' }, 3.78)
    .to('#trunk-base', { strokeDashoffset: 0, duration: 1.0, ease: 'organicGrow' }, 3.80)
    .to('#trunk-mid',  { strokeDashoffset: 0, duration: 0.75, ease: 'organicGrow' }, 4.72)
    .to('.knot',       { opacity: 1, duration: 0.3, stagger: 0.1 }, 4.85)
    .to('#trunk-top',  { strokeDashoffset: 0, duration: 0.55, ease: 'organicGrow' }, 5.42)
    .to(['#b-l1', '#b-r1'], { strokeDashoffset: 0, duration: 0.62, ease: 'power2.out', stagger: 0.07 }, 5.68)
    .to(['#b-l2', '#b-r2'], { strokeDashoffset: 0, duration: 0.58, ease: 'power2.out', stagger: 0.07 }, 5.98)
    .to(['#b-l3', '#b-r3'], { strokeDashoffset: 0, duration: 0.53, ease: 'power2.out', stagger: 0.07 }, 6.28)
    .to(['#bs-l1a','#bs-r1a','#bs-l2a','#bs-r2a'], { strokeDashoffset: 0, duration: 0.48, ease: 'power1.out', stagger: 0.06 }, 6.56)
    .to(['#bs-l1b','#bs-r1b','#bs-l2b','#bs-r2b','#bs-l3a','#bs-r3a'], { strokeDashoffset: 0, duration: 0.43, ease: 'power1.out', stagger: 0.05 }, 6.88)
    .to(['#bc-l','#bc-r','#bc-c'], { strokeDashoffset: 0, duration: 0.48, ease: 'power1.out', stagger: 0.06 }, 7.22)
    .to(['#tw-1','#tw-2','#tw-3','#tw-4','#tw-5'], { strokeDashoffset: 0, duration: 0.36, ease: 'power1.out', stagger: 0.05 }, 7.60)
    .call(generateLeaves, null, 7.92)
    .to(['#tree-layer', '#leaves-layer'], { xPercent: 25, duration: 1.4, ease: 'power3.inOut' }, 10.7)
    .to(textLayer, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 11.3)
    .to(textOrn,   { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.5)' }, 11.45)
    .call(() => {
      typewriterEffect(() => {
        // AQUÍ ESTÁ LA PARTE QUE ESTABA CORTADA EN TU CÓDIGO ORIGINAL
        gsap.to(loveSig, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' });
        setTimeout(() => {
          gsap.to([ctrDivider, ctrWrap, ctrCaption], { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' });
          startCounter();
          // Llama a la caída de hojas final después de que aparezca el contador
          setTimeout(dropLeaves, 2000);
        }, 400);
      });
    }, null, 11.5);
}

/* ── 9. EVENT LISTENERS (AHORA SÍ FUNCIONA EL CLIC) ── */
morphWrap.addEventListener('click', runMasterTimeline);
morphWrap.addEventListener('touchstart', (e) => {
  e.preventDefault();
  runMasterTimeline();
}, { passive: false });
