/* ================================================================
   VALENTINE TREE ANIMATION — script.js
   GSAP 3 · Una sola Timeline Maestra · Mobile-First
================================================================ */

/* ───────────────────────────────────────────────────────────────
   0. REGISTRO DE PLUGINS Y CUSTOM EASES
─────────────────────────────────────────────────────────────── */
gsap.registerPlugin(MorphSVGPlugin, CustomEase);

// Ease orgánico para el crecimiento del árbol (aceleración inicial fuerte, suave al final)
CustomEase.create('organicGrow',  'M0,0 C0.06,0 0.20,0.45 0.28,0.58 0.38,0.74 0.55,0.95 0.65,0.99 0.82,1.01 1,1');
// Ease para las hojas que brotan
CustomEase.create('leafBurst',    'M0,0 C0.22,-0.28 0.28,1.12 0.5,1.06 0.72,1.0 0.86,1.0 1,1');
// Ease de impacto (muy duro)
CustomEase.create('impactBounce', 'M0,0 C0.14,0 0.27,1 0.38,1 0.48,1 0.52,0.92 0.6,0.92 0.72,0.92 0.76,1 1,1');

/* ───────────────────────────────────────────────────────────────
   1. REFERENCIAS AL DOM
─────────────────────────────────────────────────────────────── */
const heartSvg   = document.getElementById('heart-svg');
const heartPath  = document.getElementById('heart-path');
const heartShine = document.getElementById('heart-shine');
const tapHint    = document.getElementById('tap-hint');
const introLayer = document.getElementById('intro-layer');
const groundLine = document.getElementById('ground-line');
const treeLayer  = document.getElementById('tree-layer');
const leavesLayer= document.getElementById('leaves-layer');
const textLayer  = document.getElementById('text-layer');
const loveText   = document.getElementById('love-text');
const loveSig    = document.getElementById('love-sig');
const ctrWrap    = document.getElementById('counter-wrap');
const ctrCaption = document.getElementById('counter-caption');
const ctrDivider = document.getElementById('counter-divider');
const textOrn    = document.getElementById('text-ornament');

/* ───────────────────────────────────────────────────────────────
   2. UTILIDAD: Calcula y asigna stroke-dasharray / dashoffset
─────────────────────────────────────────────────────────────── */
/**
 * Inicializa todos los paths del árbol para animación de "dibujo".
 * Debe llamarse JUSTO antes de que el árbol sea visible,
 * para que el dashoffset correcto esté seteado.
 */
function initTreePaths() {
  const paths = document.querySelectorAll(
    '#tree-svg .root, #tree-svg .trunk-shadow, #tree-svg .trunk, ' +
    '#tree-svg .branch, #tree-svg .knot'
  );
  paths.forEach(el => {
    // Los nudos (ellipse) no tienen getTotalLength; se manejan por opacidad
    if (el.tagName === 'ellipse') {
      gsap.set(el, { opacity: 0 });
      return;
    }
    try {
      const len = el.getTotalLength();
      gsap.set(el, {
        strokeDasharray:  len,
        strokeDashoffset: len,
      });
    } catch(e) { /* fallback silencioso */ }
  });
}

/* ───────────────────────────────────────────────────────────────
   3. ANIMACIÓN DE DIBUJO DE PATH
─────────────────────────────────────────────────────────────── */
/**
 * Devuelve un tween de gsap.to() para "dibujar" un path.
 * @param {string|Element} target - Selector o elemento
 * @param {number} duration
 * @param {string|object} ease
 */
function drawPath(target, duration = 1, ease = 'organicGrow', delay = 0) {
  return gsap.to(target, {
    strokeDashoffset: 0,
    duration,
    ease,
    delay,
  });
}

/* ───────────────────────────────────────────────────────────────
   4. GENERACIÓN DEL FOLLAJE (200 pétalos en forma de corazón)
─────────────────────────────────────────────────────────────── */
/**
 * Genera pétalos usando la fórmula paramétrica del corazón:
 *   x(t) = 16 · sin³(t)
 *   y(t) = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
 *
 * El relleno se logra con múltiples pasadas de scatter decreciente:
 *   - Pasada 1 (contorno):  scatter ~0.92–1.0
 *   - Pasada 2 (medio):     scatter ~0.55–0.88
 *   - Pasada 3 (interior):  scatter ~0.18–0.54
 *
 * Cada pétalo es un pequeño SVG con path de pétalo real.
 */
function generateLeaves() {
  const NUM = 200;
  const svgNS = 'http://www.w3.org/2000/svg';

  /* ── Centro del follaje en coordenadas de pantalla ── */
  const SW = window.innerWidth;
  const SH = window.innerHeight;

  // El árbol (tree-layer) está centrado; su copa queda aprox. en el tercio superior
  const cx = SW * 0.50;   // Centro horizontal del follaje
  const cy = SH * 0.30;   // Centro vertical del follaje (alto del árbol)

  // Radio del corazón-follaje (escala adaptativa)
  const R = Math.min(SW, SH) * 0.20;

  // Paleta de colores: rojo intenso → rosado → blush
  const palette = [
    '#b50016', '#c8001c', '#d90429', '#e4102e',
    '#ef233c', '#f03858', '#ff4d6d', '#ff7090',
    '#ffb3c1', '#ffc8d0', '#ffd6de',
  ];

  // Pesos de color (los rojos intensos son más frecuentes)
  const weights = [6, 8, 10, 10, 9, 7, 6, 5, 4, 3, 2];
  const weightedPalette = [];
  palette.forEach((c, i) => {
    for (let w = 0; w < weights[i]; w++) weightedPalette.push(c);
  });

  /* ── Distribuir puntos en 3 capas de densidad ── */
  const layers = [
    { count: 55,  scatterMin: 0.88, scatterMax: 1.02  }, // Contorno/borde
    { count: 85,  scatterMin: 0.44, scatterMax: 0.87  }, // Zona media
    { count: 60,  scatterMin: 0.08, scatterMax: 0.43  }, // Núcleo interior
  ];

  const allLeaves = [];
  let totalIdx = 0;

  layers.forEach(layer => {
    for (let i = 0; i < layer.count; i++) {
      // t recorre 0..2π distribuido con offset por capa para mayor uniformidad
      const t = (i / layer.count) * Math.PI * 2 + (totalIdx * 0.618033); // ratio áureo

      // Fórmula paramétrica del corazón (normalizada a [-1, 1] aprox.)
      const hxRaw = 16 * Math.pow(Math.sin(t), 3);
      const hyRaw = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

      // Normalizar: hxRaw ∈ [-16, 16], hyRaw ∈ [-6.3, 13] aprox.
      const nx =  hxRaw / 16.0;
      const ny =  hyRaw / 13.0;

      // Factor de scatter dentro del rango de la capa
      const scatter = layer.scatterMin + Math.random() * (layer.scatterMax - layer.scatterMin);

      // Ruido fino para organicidad
      const nx2 = nx + (Math.random() - 0.5) * 0.15;
      const ny2 = ny + (Math.random() - 0.5) * 0.15;

      // Coordenadas finales en pantalla
      const lx = cx + nx2 * scatter * R;
      const ly = cy + ny2 * scatter * R * 0.96;

      // Tamaño del pétalo: más pequeños en borde, más grandes en interior
      const baseSize = 9 + Math.random() * 13;
      const sizeBonus = (1 - scatter) * 4; // hojas del centro ligeramente más grandes
      const size = baseSize + sizeBonus;

      // Color aleatorio ponderado
      const color = weightedPalette[Math.floor(Math.random() * weightedPalette.length)];
      const alpha = 0.72 + Math.random() * 0.28;
      const rot   = Math.random() * 360;

      // Distancia al centro (para ordenar el stagger)
      const dist  = Math.hypot(lx - cx, ly - cy);

      /* ── Crear elemento SVG pétalo ── */
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.classList.add('leaf');
      svg.style.left       = lx + 'px';
      svg.style.top        = ly + 'px';
      svg.style.marginLeft = -(size / 2) + 'px';
      svg.style.marginTop  = -(size / 2) + 'px';

      /*
        Pétalo real: forma ovalada con punta inferior (no mini-corazón).
        Esto da la sensación de hoja de cerezo / magnolia.
      */
      const path = document.createElementNS(svgNS, 'path');
      // Pétalo: punta abajo, redondeado arriba, ligera asimetría
      path.setAttribute('d',
        'M10,1 C14,1 18,5 18,9.5 C18,14 15,18 10,19.5 C5,18 2,14 2,9.5 C2,5 6,1 10,1 Z'
      );
      path.setAttribute('fill', color);
      path.setAttribute('opacity', alpha);

      // Brillo sutil en el pétalo
      const shine = document.createElementNS(svgNS, 'ellipse');
      shine.setAttribute('cx', '8');
      shine.setAttribute('cy', '7');
      shine.setAttribute('rx', '3');
      shine.setAttribute('ry', '2');
      shine.setAttribute('fill', 'white');
      shine.setAttribute('opacity', '0.22');
      shine.setAttribute('transform', `rotate(-20,8,7)`);

      svg.appendChild(path);
      svg.appendChild(shine);
      leavesLayer.appendChild(svg);

      // Guardar datos para animación de caída
      svg.dataset.cx    = lx;
      svg.dataset.cy    = ly;
      svg.dataset.dist  = dist;
      svg.dataset.rot   = rot;
      svg.dataset.size  = size;

      allLeaves.push({ el: svg, dist, lx, ly });
      totalIdx++;
    }
  });

  /* ── Ordenar por distancia (stagger de adentro hacia afuera) ── */
  allLeaves.sort((a, b) => a.dist - b.dist);
  const sortedEls = allLeaves.map(l => l.el);

  /* ── GSAP: aparición con stagger ── */
  const leafTl = gsap.timeline();
  leafTl.set(sortedEls, { scale: 0, opacity: 0 });
  leafTl.to(sortedEls, {
    scale:   1,
    opacity: 1,
    rotate:  () => Math.random() * 360,
    duration: 0.5,
    ease:    'leafBurst',
    stagger: {
      each: 0.010,    // 0.010s entre cada hoja = ~2s para 200 hojas
      from: 'start',  // de adentro hacia afuera (ya ordenadas por dist)
    },
  });

  return leafTl;
}

/* ───────────────────────────────────────────────────────────────
   5. EFECTO TYPEWRITER
─────────────────────────────────────────────────────────────── */
const MESSAGE = (
  'Para la persona que me hizo recordar\n' +
  'cómo se siente el amor:\n\n' +
  'Si me dieran a elegir el lugar\n' +
  'para estar el resto de mi vida,\n' +
  'sería abrazado a tu cuerpo,\n' +
  'viéndonos a los ojos\n' +
  'por toda la eternidad.'
);

function typewriterEffect(onComplete) {
  loveText.classList.add('typing');
  const chars = MESSAGE.split('');
  let idx = 0;

  const SPEED = 38; // ms por carácter
  const tick = () => {
    if (idx >= chars.length) {
      loveText.classList.remove('typing');
      if (onComplete) onComplete();
      return;
    }
    const ch = chars[idx];
    loveText.innerHTML += (ch === '\n') ? '<br>' : ch;
    idx++;
    setTimeout(tick, ch === '\n' ? SPEED * 3 : SPEED);
  };
  tick();
}

/* ───────────────────────────────────────────────────────────────
   6. CONTADOR DINÁMICO (desde 12/04/2021)
─────────────────────────────────────────────────────────────── */
const LOVE_START = new Date(2021, 3, 12); // mes 0-indexed

function calcDiff() {
  const now = new Date();
  let y = now.getFullYear() - LOVE_START.getFullYear();
  let m = now.getMonth()    - LOVE_START.getMonth();
  let d = now.getDate()     - LOVE_START.getDate();
  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}

function animCounterUnit(elId, target) {
  const el = document.querySelector(`#${elId} .cn`);
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.6,
    ease: 'power2.out',
    onUpdate() { el.textContent = Math.round(obj.val); },
    onComplete() { el.textContent = target; },
  });
}

function startCounter() {
  const { y, m, d } = calcDiff();
  animCounterUnit('cu-y', y);
  setTimeout(() => animCounterUnit('cu-m', m),  300);
  setTimeout(() => animCounterUnit('cu-d', d),  550);

  // Actualizar cada hora
  setInterval(() => {
    const diff = calcDiff();
    document.querySelector('#cu-y .cn').textContent = diff.y;
    document.querySelector('#cu-m .cn').textContent = diff.m;
    document.querySelector('#cu-d .cn').textContent = diff.d;
  }, 3_600_000);
}

/* ───────────────────────────────────────────────────────────────
   7. CAÍDA DE HOJAS (ZIG-ZAG SWAY — 20 hojas al azar)
─────────────────────────────────────────────────────────────── */
function dropLeaves() {
  const all = Array.from(document.querySelectorAll('.leaf'));
  if (!all.length) return;

  // Mezclar y tomar 20
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 20);
  const SH = window.innerHeight;

  shuffled.forEach((leaf, i) => {
    const startY  = parseFloat(leaf.style.top);
    const fallY   = SH - startY + 80;
    const swingAmp= 22 + Math.random() * 45;   // amplitud horizontal del sway
    const dur     = 2.8 + Math.random() * 2.2; // duración caída
    const delay   = i * 0.18 + Math.random() * 0.35;

    // GSAP timeline individual por hoja
    const tl = gsap.timeline({ delay });

    // Caída vertical (aceleración de gravedad)
    tl.to(leaf, {
      y:        fallY,
      duration: dur,
      ease:     'power1.in',
    }, 0);

    // Sway horizontal zig-zag (yoyo)
    tl.to(leaf, {
      x:        `+=${swingAmp}`,
      rotation: '+=' + (90 + Math.random() * 180),
      duration: dur / 4,
      ease:     'sine.inOut',
      repeat:   3,
      yoyo:     true,
    }, 0);

    // Fundido al llegar al suelo
    tl.to(leaf, {
      opacity: 0,
      duration: 0.9,
      ease:    'power2.in',
    }, dur - 0.9);
  });
}

/* ───────────────────────────────────────────────────────────────
   8. TIMELINE MAESTRA
─────────────────────────────────────────────────────────────── */
let animStarted = false;

function startMasterTimeline() {
  if (animStarted) return;
  animStarted = true;

  /* Detener la animación CSS del latido */
  heartSvg.style.animation = 'none';
  gsap.killTweensOf(heartSvg);

  /* ════════════════════════════════════════════
     TIMELINE MAESTRA
  ════════════════════════════════════════════ */
  const master = gsap.timeline();

  /* ─────────────────────────────────────────
     FASE 1 · MORPHING CORAZÓN → CÍRCULO
  ───────────────────────────────────────── */
  master

    // Ocultar hint
    .to(tapHint, { opacity: 0, duration: 0.25 }, 0)

    // Escalado rápido "late" final antes de morph
    .to(heartSvg, {
      scale:    1.18,
      duration: 0.18,
      ease:    'power2.out',
    }, 0.05)

    // MORPHING: corazón → óvalo transición
    .to(heartPath, {
      morphSVG: {
        shape: 'M50,78 C50,78 10,54 10,33 C10,16 22,6 36,6 C43,6 48,10 50,16 C52,10 57,6 64,6 C78,6 90,16 90,33 C90,54 50,78 50,78 Z',
      },
      duration: 0.42,
      ease:    'power2.inOut',
    }, 0.23)
    .to(heartShine, { opacity: 0, duration: 0.3 }, 0.23)

    // MORPHING: óvalo → círculo completo
    .to(heartPath, {
      morphSVG: {
        shape: 'M50,84 C25,84 6,65 6,40 C6,15 25,-4 50,-4 C75,-4 94,15 94,40 C94,65 75,84 50,84 Z',
      },
      fill:    'url(#hGrad)',
      duration: 0.38,
      ease:    'power2.in',
    }, 0.65)

    // Volver a escala 1 durante el morph
    .to(heartSvg, {
      scale:    1.0,
      duration: 0.3,
      ease:    'power1.out',
    }, 0.25)

  /* ─────────────────────────────────────────
     FASE 2 · CAÍDA + SQUASH & STRETCH
  ───────────────────────────────────────── */

    // Mostrar línea de suelo
    .to(groundLine, { opacity: 1, scaleX: 0, duration: 0 }, 1.0)
    .to(groundLine, {
      opacity: 1,
      scaleX:  1,
      duration: 0.6,
      ease:    'power2.out',
    }, 1.0)

    // Preparar caída: STRETCH vertical (la pelota se alarga al acelerar)
    .to(heartSvg, {
      scaleY:  1.22,
      scaleX:  0.88,
      duration: 0.18,
      ease:    'power1.in',
    }, 1.05)

    // Caída libre al suelo
    .to(heartSvg, {
      y:        '58vh',
      scaleY:   1.0,
      scaleX:   1.0,
      duration: 0.52,
      ease:    'power2.in',
    }, 1.23)

    // SQUASH al impacto (aplastamiento elástico)
    .to(heartSvg, {
      scaleY:          0.42,
      scaleX:          1.55,
      transformOrigin: '50% 100%',
      y:               '+=4px',
      duration:        0.10,
      ease:           'power4.out',
    }, 1.75)

    // Rebote 1: STRETCH + salto
    .to(heartSvg, {
      scaleY:  1.38,
      scaleX:  0.76,
      y:       '44vh',
      duration: 0.22,
      ease:   'power2.out',
    }, 1.85)

    // Squash 2 (menor)
    .to(heartSvg, {
      scaleY:          0.68,
      scaleX:          1.22,
      y:               '58vh',
      transformOrigin: '50% 100%',
      duration:        0.14,
      ease:           'power2.in',
    }, 2.07)

    // Rebote 2 (más pequeño)
    .to(heartSvg, {
      scaleY:  1.12,
      scaleX:  0.92,
      y:       '52vh',
      duration: 0.16,
      ease:   'power2.out',
    }, 2.21)

    // Settling final
    .to(heartSvg, {
      scaleY:  1.0,
      scaleX:  1.0,
      y:       '58vh',
      duration: 0.22,
      ease:   'elastic.out(1, 0.55)',
    }, 2.37)

    // Pausa breve en el suelo
    .to({}, { duration: 0.3 }, 2.6)

    // Hundimiento en el suelo (desaparece)
    .to(heartSvg, {
      scaleY:  0,
      scaleX:  1.4,
      opacity: 0,
      duration: 0.4,
      ease:   'power3.in',
    }, 2.9)

    // Ocultar capa intro
    .set(introLayer, { visibility: 'hidden' }, 3.35)

  /* ─────────────────────────────────────────
     FASE 3 · ÁRBOL CRECE (stroke-dashoffset)
  ───────────────────────────────────────── */

    // Mostrar capa del árbol
    .call(initTreePaths, null, 3.3)
    .to(treeLayer, { opacity: 1, duration: 0.01 }, 3.3)

    /* RAÍCES — emergen del suelo */
    .to(['#root-l1', '#root-r1'], {
      strokeDashoffset: 0,
      duration: 0.55,
      ease:    'power1.out',
      stagger:  0.08,
    }, 3.4)
    .to(['#root-l2', '#root-r2', '#root-c'], {
      strokeDashoffset: 0,
      duration: 0.45,
      ease:    'power1.out',
      stagger:  0.07,
    }, 3.65)

    /* TRONCO: sombra + segmentos base→mid→top */
    .to('#trunk-shad', {
      strokeDashoffset: 0,
      duration: 0.95,
      ease:    'organicGrow',
    }, 3.9)
    .to('#trunk-base', {
      strokeDashoffset: 0,
      duration: 1.0,
      ease:    'organicGrow',
    }, 3.92)
    .to(['#trunk-mid', '.knot'], {
      strokeDashoffset: 0,
      opacity:          1,
      duration: 0.75,
      ease:    'organicGrow',
      stagger:  0.05,
    }, 4.82)
    .to('#trunk-top', {
      strokeDashoffset: 0,
      duration: 0.55,
      ease:    'organicGrow',
    }, 5.52)

    /* RAMAS PRIMARIAS (izq + der simultáneamente) */
    .to(['#b-l1', '#b-r1'], {
      strokeDashoffset: 0,
      duration: 0.65,
      ease:    'power2.out',
      stagger:  0.07,
    }, 5.8)
    .to(['#b-l2', '#b-r2'], {
      strokeDashoffset: 0,
      duration: 0.6,
      ease:    'power2.out',
      stagger:  0.07,
    }, 6.1)
    .to(['#b-l3', '#b-r3'], {
      strokeDashoffset: 0,
      duration: 0.55,
      ease:    'power2.out',
      stagger:  0.07,
    }, 6.42)

    /* RAMAS SECUNDARIAS */
    .to(['#bs-l1a', '#bs-r1a', '#bs-l2a', '#bs-r2a'], {
      strokeDashoffset: 0,
      duration: 0.50,
      ease:    'power1.out',
      stagger:  0.06,
    }, 6.72)
    .to(['#bs-l1b', '#bs-r1b', '#bs-l2b', '#bs-r2b', '#bs-l3a', '#bs-r3a'], {
      strokeDashoffset: 0,
      duration: 0.45,
      ease:    'power1.out',
      stagger:  0.05,
    }, 7.05)

    /* CORONA */
    .to(['#bc-l', '#bc-r', '#bc-c'], {
      strokeDashoffset: 0,
      duration: 0.5,
      ease:    'power1.out',
      stagger:  0.06,
    }, 7.42)

    /* RAMITAS TERMINALES */
    .to(['#tw-1', '#tw-2', '#tw-3', '#tw-4', '#tw-5'], {
      strokeDashoffset: 0,
      duration: 0.38,
      ease:    'power1.out',
      stagger:  0.05,
    }, 7.82)

  /* ─────────────────────────────────────────
     FASE 4 · FOLLAJE — 200 pétalos brotan
  ───────────────────────────────────────── */

    // Generar y animar las hojas
    .call(generateLeaves, null, 8.1)

  /* ─────────────────────────────────────────
     FASE 5 · DESPLAZAMIENTO + TEXTO
  ───────────────────────────────────────── */

    // Árbol + hojas se desplazan a la derecha
    .to(['#tree-layer', '#leaves-layer'], {
      xPercent: 25,
      duration: 1.5,
      ease:    'power3.inOut',
    }, 11.0)

    // Aparición del bloque de texto (fade + slide-up)
    .to(textLayer, {
      opacity:  1,
      duration: 0.5,
      ease:    'power2.out',
    }, 11.6)
    .to(textOrn, {
      opacity:   1,
      y:         0,
      duration:  0.6,
      ease:     'back.out(1.5)',
    }, 11.75)

    // Typewriter del texto
    .call(() => {
      typewriterEffect(() => {
        // Cuando termina el texto, aparecen firma y contador

        gsap.to(loveSig, {
          opacity:  1,
          y:        0,
          duration: 0.7,
          ease:    'power2.out',
        });

        setTimeout(() => {
          gsap.to([ctrDivider, ctrWrap], {
            opacity:  1,
            y:        0,
            duration: 0.6,
            ease:    'power2.out',
            stagger:  0.15,
          });
          gsap.to(ctrCaption, { opacity: 0.7, duration: 0.5, delay: 0.4 });
          startCounter();
        }, 500);
      });
    }, null, 12.2)

  /* ─────────────────────────────────────────
     FASE 6 · CAÍDA DE HOJAS (ZIG-ZAG)
  ───────────────────────────────────────── */

    .call(dropLeaves, null, 15.5);

  return master;
}

/* ───────────────────────────────────────────────────────────────
   9. SETUP INICIAL DEL ESTADO DE TEXTO
─────────────────────────────────────────────────────────────── */
// Asegurar que los elementos de texto comienzan ocultos con transform
gsap.set([loveSig, ctrWrap, ctrDivider, ctrCaption], { opacity: 0, y: 12 });
gsap.set(textOrn,  { opacity: 0, y: 8 });

/* ───────────────────────────────────────────────────────────────
   10. EVENTOS DE INICIO
─────────────────────────────────────────────────────────────── */
heartSvg.addEventListener('click', startMasterTimeline);
heartSvg.addEventListener('touchend', e => {
  e.preventDefault();
  startMasterTimeline();
});

/* ───────────────────────────────────────────────────────────────
   11. PARALLAX SUTIL EN DESKTOP (no interrumpe la timeline)
─────────────────────────────────────────────────────────────── */
let parallaxEnabled = false;
setTimeout(() => { parallaxEnabled = true; }, 12500);

document.addEventListener('mousemove', e => {
  if (!parallaxEnabled || !animStarted) return;
  const dx = (e.clientX / window.innerWidth  - 0.5) * 6;
  const dy = (e.clientY / window.innerHeight - 0.5) * 4;
  gsap.to(['#tree-layer', '#leaves-layer'], {
    x:        `+=${dx * 0.04}`,
    y:        `+=${dy * 0.04}`,
    duration: 1.2,
    ease:    'power1.out',
    overwrite: 'auto',
  });
});

/* ───────────────────────────────────────────────────────────────
   12. MANEJADOR DE RESIZE (recalcula posiciones si cambia tamaño)
─────────────────────────────────────────────────────────────── */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Solo reposiciona las hojas si ya fueron generadas
    // (evita recálculo innecesario en mobile al aparecer/ocultar barra del navegador)
  }, 400);
});
