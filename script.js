/* ================================================================
   VALENTINE TREE — script.js
   ✅ SOLO gsap.min.js (core) — CERO plugins adicionales
   CustomEase ELIMINADO → eases nativos de GSAP únicamente
================================================================ */

/* ─── VERIFICACIÓN DE CARGA ───
   Si gsap no cargó (sin conexión), mostramos un mensaje amable.     */
if (typeof gsap === 'undefined') {
  document.body.innerHTML =
    '<p style="text-align:center;margin-top:40vh;font-family:serif;color:#c8001c">' +
    'Necesitas conexión a internet para ver esta animación ❤</p>';
  throw new Error('GSAP no disponible');
}

/* ══════════════════════════════════════════════════════════════
   1. REFERENCIAS DOM
══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   2. ESTADO INICIAL
══════════════════════════════════════════════════════════════ */
gsap.set([loveSig, ctrWrap, ctrDivider, ctrCaption], { opacity: 0, y: 12 });
gsap.set(textOrn, { opacity: 0, y: 8 });
gsap.set(circleSvg, { opacity: 0 });       // círculo oculto hasta el morph

/* ══════════════════════════════════════════════════════════════
   3. INICIALIZAR PATHS DEL ÁRBOL (stroke-dashoffset)
   Se llama justo antes de mostrar el árbol.
══════════════════════════════════════════════════════════════ */
function initTreePaths() {
  const paths = document.querySelectorAll('#tree-svg .treepath, #tree-svg .root');
  paths.forEach(function(el) {
    try {
      var len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    } catch(e) {
      /* ellipse u otros elementos sin getTotalLength — ignorar */
    }
  });
  gsap.set('.knot', { opacity: 0 });
}

/* ══════════════════════════════════════════════════════════════
   4. GENERAR 200 PÉTALOS EN FORMA DE CORAZÓN
   Fórmula paramétrica del corazón + 3 capas de scatter.
══════════════════════════════════════════════════════════════ */
function generateLeaves() {
  var svgNS = 'http://www.w3.org/2000/svg';
  var SW = window.innerWidth;
  var SH = window.innerHeight;

  /* Centro del follaje: tercio superior de pantalla */
  var cx = SW * 0.50;
  var cy = SH * 0.29;
  var R  = Math.min(SW, SH) * 0.19;

  /* Paleta ponderada: rojos intensos más frecuentes */
  var palette = [
    '#b50016','#c8001c','#d90429','#e4102e',
    '#ef233c','#f03858','#ff4d6d','#ff7090',
    '#ffb3c1','#ffc8d0'
  ];
  var weights = [6, 8, 10, 10, 9, 7, 5, 4, 3, 2];
  var pool = [];
  palette.forEach(function(c, i) {
    for (var w = 0; w < weights[i]; w++) pool.push(c);
  });

  /* Tres capas: borde / zona media / núcleo interior */
  var layers = [
    { count: 55, sMin: 0.88, sMax: 1.02 },   // contorno
    { count: 85, sMin: 0.44, sMax: 0.87 },   // zona media
    { count: 60, sMin: 0.08, sMax: 0.43 },   // núcleo
  ];

  var allLeaves = [];
  var globalIdx = 0;

  layers.forEach(function(layer) {
    for (var i = 0; i < layer.count; i++) {

      /* Distribución uniforme con offset áureo (evita agrupaciones) */
      var t = (i / layer.count) * Math.PI * 2 + globalIdx * 0.618033;

      /* Fórmula paramétrica del corazón */
      var hx =  16 * Math.pow(Math.sin(t), 3);
      var hy = -(13 * Math.cos(t)
               - 5  * Math.cos(2 * t)
               - 2  * Math.cos(3 * t)
               -      Math.cos(4 * t));

      /* Normalizar a [-1, 1] */
      var nx = hx / 16;
      var ny = hy / 13;

      /* Scatter dentro del rango de la capa + ruido fino */
      var sc  = layer.sMin + Math.random() * (layer.sMax - layer.sMin);
      var nx2 = nx + (Math.random() - 0.5) * 0.14;
      var ny2 = ny + (Math.random() - 0.5) * 0.14;

      var lx = cx + nx2 * sc * R;
      var ly = cy + ny2 * sc * R * 0.96;

      /* Tamaño: ligeramente mayor en el centro */
      var size = 9 + Math.random() * 13 + (1 - sc) * 4;
      var color = pool[Math.floor(Math.random() * pool.length)];
      var alpha = 0.72 + Math.random() * 0.28;
      var dist  = Math.hypot(lx - cx, ly - cy);

      /* Crear elemento SVG pétalo */
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width',   size);
      svg.setAttribute('height',  size);
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.classList.add('leaf');
      svg.style.left       = lx + 'px';
      svg.style.top        = ly + 'px';
      svg.style.marginLeft = -(size / 2) + 'px';
      svg.style.marginTop  = -(size / 2) + 'px';

      /* Forma ovalada con punta inferior (pétalo real) */
      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d',
        'M10,1 C14,1 18,5 18,9.5 C18,14 15,18 10,19.5' +
        ' C5,18 2,14 2,9.5 C2,5 6,1 10,1Z'
      );
      path.setAttribute('fill',    color);
      path.setAttribute('opacity', alpha);

      /* Brillo interior sutil */
      var shine = document.createElementNS(svgNS, 'ellipse');
      shine.setAttribute('cx', '8'); shine.setAttribute('cy', '7');
      shine.setAttribute('rx', '3'); shine.setAttribute('ry', '2');
      shine.setAttribute('fill', 'white');
      shine.setAttribute('opacity', '0.20');
      shine.setAttribute('transform', 'rotate(-20,8,7)');

      svg.appendChild(path);
      svg.appendChild(shine);
      leavesLayer.appendChild(svg);

      svg.dataset.dist = dist;
      allLeaves.push({ el: svg, dist: dist });
      globalIdx++;
    }
  });

  /* Ordenar de centro → afuera para stagger centrífugo */
  allLeaves.sort(function(a, b) { return a.dist - b.dist; });
  var sorted = allLeaves.map(function(l) { return l.el; });

  /* Animar aparición con stagger */
  gsap.set(sorted, { scale: 0, opacity: 0 });
  gsap.to(sorted, {
    scale:    1,
    opacity:  1,
    rotate:   function() { return Math.random() * 360; },
    duration: 0.52,
    ease:     'back.out(1.6)',     /* ← ease nativo de GSAP, sin plugin */
    stagger:  { each: 0.010, from: 'start' },
  });
}

/* ══════════════════════════════════════════════════════════════
   5. TYPEWRITER
══════════════════════════════════════════════════════════════ */
var MESSAGE =
  'Para la persona que me hizo recordar\n' +
  'cómo se siente el amor:\n\n' +
  'Si me dieran a elegir el lugar\n' +
  'para estar el resto de mi vida,\n' +
  'sería abrazado a tu cuerpo,\n' +
  'viéndonos a los ojos\n' +
  'por toda la eternidad.';

function typewriterEffect(onComplete) {
  loveText.classList.add('typing');
  var chars = MESSAGE.split('');
  var i = 0;
  function tick() {
    if (i >= chars.length) {
      loveText.classList.remove('typing');
      if (onComplete) onComplete();
      return;
    }
    var ch = chars[i++];
    loveText.innerHTML += (ch === '\n') ? '<br>' : ch;
    setTimeout(tick, ch === '\n' ? 110 : 36);
  }
  tick();
}

/* ══════════════════════════════════════════════════════════════
   6. CONTADOR DESDE 12-04-2021
══════════════════════════════════════════════════════════════ */
var LOVE_START = new Date(2021, 3, 12);   // mes 0-indexed

function getTimeDiff() {
  var now = new Date();
  var y = now.getFullYear() - LOVE_START.getFullYear();
  var m = now.getMonth()    - LOVE_START.getMonth();
  var d = now.getDate()     - LOVE_START.getDate();
  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) { y--; m += 12; }
  return { y: y, m: m, d: d };
}

function animateCounterNum(id, target) {
  var el  = document.querySelector('#' + id + ' .cn');
  var obj = { v: 0 };
  gsap.to(obj, {
    v: target, duration: 1.6, ease: 'power2.out',
    onUpdate:  function() { el.textContent = Math.round(obj.v); },
    onComplete: function() { el.textContent = target; },
  });
}

function startCounter() {
  var diff = getTimeDiff();
  animateCounterNum('cu-y', diff.y);
  setTimeout(function() { animateCounterNum('cu-m', diff.m); }, 300);
  setTimeout(function() { animateCounterNum('cu-d', diff.d); }, 550);
}

/* ══════════════════════════════════════════════════════════════
   7. CAÍDA DE HOJAS EN ZIG-ZAG (20 hojas al azar)
══════════════════════════════════════════════════════════════ */
function dropLeaves() {
  var all = Array.from(document.querySelectorAll('.leaf'));
  if (!all.length) return;

  /* Fisher-Yates shuffle */
  for (var i = all.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
  }
  var chosen = all.slice(0, 20);
  var SH = window.innerHeight;

  chosen.forEach(function(leaf, idx) {
    var startY    = parseFloat(leaf.style.top);
    var fallDist  = SH - startY + 80;
    var swingAmp  = 20 + Math.random() * 40;
    var dur       = 2.8 + Math.random() * 2.2;
    var delay     = idx * 0.16 + Math.random() * 0.4;

    var tl = gsap.timeline({ delay: delay });

    /* Caída con gravedad */
    tl.to(leaf, { y: fallDist, duration: dur, ease: 'power1.in' }, 0);

    /* Sway zig-zag horizontal */
    tl.to(leaf, {
      x:        '+=' + swingAmp,
      rotation: '+=' + (80 + Math.random() * 200),
      duration: dur / 4,
      ease:     'sine.inOut',
      repeat:   3,
      yoyo:     true,
    }, 0);

    /* Fundido al tocar el suelo */
    tl.to(leaf, {
      opacity:  0,
      duration: 0.85,
      ease:     'power2.in',
    }, dur - 0.85);
  });
}

/* ══════════════════════════════════════════════════════════════
   8. TIMELINE MAESTRA
   Una sola gsap.timeline() controla toda la secuencia.
   Eases usados: power1, power2, power3, power4, elastic, back, sine
   → TODOS son nativos de GSAP core, sin ningún plugin externo.
══════════════════════════════════════════════════════════════ */
var started = false;

function runMasterTimeline() {
  if (started) return;
  started = true;

  /* Detener animación CSS del latido */
  heartSvg.style.animation = 'none';
  gsap.killTweensOf(heartSvg);

  var master = gsap.timeline();

  /* ──────────────────────────────────────────────────────────
     FASE 1 · MORPH CORAZÓN → CÍRCULO (crossfade + scale)
  ────────────────────────────────────────────────────────── */
  master

    /* Ocultar hint */
    .to(tapHint, { opacity: 0, duration: 0.2 }, 0)

    /* Latido manual final antes del morph */
    .to(morphWrap, { scale: 1.14, duration: 0.18, ease: 'power2.out' }, 0.05)
    .to(morphWrap, { scale: 1.01, duration: 0.14, ease: 'power2.in'  }, 0.23)

    /* Crossfade corazón → círculo */
    .to(heartSvg, {
      opacity:  0,
      scale:    0.8,
      duration: 0.48,
      ease:     'power2.inOut',
    }, 0.40)
    .to(circleSvg, {
      opacity:  1,
      scale:    1,
      duration: 0.48,
      ease:     'power2.inOut',
    }, 0.40)

    /* Squeeze antes de caer */
    .to(morphWrap, {
      scaleY: 1.18, scaleX: 0.86,
      duration: 0.20, ease: 'power1.in',
    }, 0.92)

  /* ──────────────────────────────────────────────────────────
     FASE 2 · CAÍDA + SQUASH & STRETCH
  ────────────────────────────────────────────────────────── */

    /* Mostrar línea de suelo */
    .to(groundLine, {
      opacity: 1, scaleX: 1,
      transformOrigin: 'center',
      duration: 0.6, ease: 'power2.out',
    }, 1.0)

    /* Caída libre */
    .to(morphWrap, {
      y: '55vh', scaleY: 1.0, scaleX: 1.0,
      duration: 0.55, ease: 'power2.in',
    }, 1.12)

    /* SQUASH al impacto */
    .to(morphWrap, {
      scaleY: 0.38, scaleX: 1.60,
      transformOrigin: '50% 100%',
      duration: 0.10, ease: 'power4.out',
    }, 1.67)

    /* STRETCH — rebote 1 */
    .to(morphWrap, {
      scaleY: 1.40, scaleX: 0.74, y: '42vh',
      duration: 0.22, ease: 'power2.out',
    }, 1.77)

    /* Squash 2 (menor) */
    .to(morphWrap, {
      scaleY: 0.62, scaleX: 1.24, y: '55vh',
      transformOrigin: '50% 100%',
      duration: 0.14, ease: 'power2.in',
    }, 1.99)

    /* Rebote 2 */
    .to(morphWrap, {
      scaleY: 1.10, scaleX: 0.93, y: '50vh',
      duration: 0.14, ease: 'power2.out',
    }, 2.13)

    /* Settling elástico final */
    .to(morphWrap, {
      scaleY: 1.0, scaleX: 1.0, y: '55vh',
      duration: 0.20, ease: 'elastic.out(1, 0.5)',
    }, 2.27)

    /* Pausa en suelo */
    .to({}, { duration: 0.25 }, 2.5)

    /* Hundimiento y desaparición */
    .to(morphWrap, {
      scaleY: 0, scaleX: 1.5, opacity: 0,
      duration: 0.38, ease: 'power3.in',
    }, 2.75)

    /* Ocultar intro */
    .set(introLayer, { visibility: 'hidden' }, 3.2)

  /* ──────────────────────────────────────────────────────────
     FASE 3 · ÁRBOL CRECE (stroke-dashoffset)
     Eases: power1.out, power2.out — todos nativos
  ────────────────────────────────────────────────────────── */

    .call(initTreePaths, null, 3.15)
    .to(treeLayer, { opacity: 1, duration: 0.01 }, 3.15)

    /* Raíces */
    .to(['#root-l1','#root-r1'], {
      strokeDashoffset: 0, duration: 0.55, ease: 'power1.out', stagger: 0.08,
    }, 3.25)
    .to(['#root-l2','#root-r2','#root-c'], {
      strokeDashoffset: 0, duration: 0.45, ease: 'power1.out', stagger: 0.07,
    }, 3.52)

    /* Tronco (base → mid → top) */
    .to('#trunk-shad', { strokeDashoffset: 0, duration: 1.0,  ease: 'power2.inOut' }, 3.78)
    .to('#trunk-base', { strokeDashoffset: 0, duration: 1.0,  ease: 'power2.inOut' }, 3.80)
    .to('#trunk-mid',  { strokeDashoffset: 0, duration: 0.75, ease: 'power2.out'   }, 4.72)
    .to('.knot',       { opacity: 1, duration: 0.3, stagger: 0.1 }, 4.85)
    .to('#trunk-top',  { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out'   }, 5.42)

    /* Ramas primarias */
    .to(['#b-l1','#b-r1'], {
      strokeDashoffset: 0, duration: 0.62, ease: 'power2.out', stagger: 0.07,
    }, 5.68)
    .to(['#b-l2','#b-r2'], {
      strokeDashoffset: 0, duration: 0.58, ease: 'power2.out', stagger: 0.07,
    }, 5.98)
    .to(['#b-l3','#b-r3'], {
      strokeDashoffset: 0, duration: 0.53, ease: 'power2.out', stagger: 0.07,
    }, 6.28)

    /* Ramas secundarias */
    .to(['#bs-l1a','#bs-r1a','#bs-l2a','#bs-r2a'], {
      strokeDashoffset: 0, duration: 0.48, ease: 'power1.out', stagger: 0.06,
    }, 6.56)
    .to(['#bs-l1b','#bs-r1b','#bs-l2b','#bs-r2b','#bs-l3a','#bs-r3a'], {
      strokeDashoffset: 0, duration: 0.43, ease: 'power1.out', stagger: 0.05,
    }, 6.88)

    /* Corona */
    .to(['#bc-l','#bc-r','#bc-c'], {
      strokeDashoffset: 0, duration: 0.48, ease: 'power1.out', stagger: 0.06,
    }, 7.22)

    /* Ramitas terminales */
    .to(['#tw-1','#tw-2','#tw-3','#tw-4','#tw-5'], {
      strokeDashoffset: 0, duration: 0.36, ease: 'power1.out', stagger: 0.05,
    }, 7.60)

  /* ──────────────────────────────────────────────────────────
     FASE 4 · FOLLAJE (200 pétalos)
  ────────────────────────────────────────────────────────── */
    .call(generateLeaves, null, 7.92)

  /* ──────────────────────────────────────────────────────────
     FASE 5 · DESPLAZAMIENTO + TEXTO
  ────────────────────────────────────────────────────────── */

    /* Árbol + hojas se mueven a la derecha */
    .to(['#tree-layer','#leaves-layer'], {
      xPercent: 25, duration: 1.4, ease: 'power3.inOut',
    }, 10.7)

    /* Capa de texto aparece */
    .to(textLayer, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 11.3)
    .to(textOrn, {
      opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.5)',
    }, 11.45)

    /* Typewriter: inicia a los 11.85s */
    .call(function() {
      typewriterEffect(function() {
        /* Cuando termina el texto → firma y contador */
        gsap.to(loveSig, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' });

        setTimeout(function() {
          gsap.to([ctrDivider, ctrWrap], {
            opacity: 1, y: 0, duration: 0.55,
            ease: 'power2.out', stagger: 0.15,
          });
          gsap.to(ctrCaption, { opacity: 0.7, duration: 0.45, delay: 0.35 });
          startCounter();
        }, 450);
      });
    }, null, 11.85)

  /* ──────────────────────────────────────────────────────────
     FASE 6 · CAÍDA DE HOJAS EN ZIG-ZAG
  ────────────────────────────────────────────────────────── */
    .call(dropLeaves, null, 15.0);

  return master;
}

/* ══════════════════════════════════════════════════════════════
   9. EVENTOS (click + touchend)
══════════════════════════════════════════════════════════════ */
function handleStart(e) {
  if (e.type === 'touchend') e.preventDefault();
  runMasterTimeline();
}

morphWrap.addEventListener('click',    handleStart);
morphWrap.addEventListener('touchend', handleStart, { passive: false });

/* ══════════════════════════════════════════════════════════════
   10. PARALLAX SUTIL EN DESKTOP (opcional, no afecta timeline)
══════════════════════════════════════════════════════════════ */
var parallaxReady = false;
setTimeout(function() { parallaxReady = true; }, 12500);

document.addEventListener('mousemove', function(e) {
  if (!parallaxReady || !started) return;
  var dx = (e.clientX / window.innerWidth  - 0.5) * 6;
  var dy = (e.clientY / window.innerHeight - 0.5) * 4;
  gsap.to(['#tree-layer','#leaves-layer'], {
    x: '+=' + (dx * 0.04),
    y: '+=' + (dy * 0.04),
    duration: 1.2, ease: 'power1.out',
    overwrite: 'auto',
  });
});
