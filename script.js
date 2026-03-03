/* ================================================================
   TE AMO — script.js
   GSAP 3 core ÚNICAMENTE. Cero plugins externos.
   
   FIXES APLICADOS:
   1. Contador con horas/minutos/segundos en vivo (tican cada seg)
   2. Corazón más pequeño; pelota MÁS pequeña que corazón (shrink)
   3. "Te amo" reemplaza "toca para comenzar"; desaparece antes
   4. Árbol: initTreePaths() al CARGAR la página (no en timeline)
      → elimina los círculos marrones del bug anterior
   5. Hojas con forma de corazón, colores sólidos (sin opacidad),
      500 hojas para cubrir ramas completamente
   6. Texto más lento (68ms/char); música music.mp3 se reproduce
================================================================ */

/* Seguridad: verificar que GSAP cargó */
if (typeof gsap === 'undefined') {
  document.body.innerHTML =
    '<p style="text-align:center;padding:40vh 5vw;font-family:serif;color:#c8001c;font-size:1.1rem">' +
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
const ctrLive     = document.getElementById('counter-live');
const ctrDivider  = document.getElementById('counter-divider');
const ctrCaption  = document.getElementById('counter-caption');
const textOrn     = document.getElementById('text-ornament');
const bgMusic     = document.getElementById('bg-music');

/* ══════════════════════════════════════════════════════════════
   2. ESTADOS INICIALES (elementos que aparecen más tarde)
══════════════════════════════════════════════════════════════ */
gsap.set([loveSig, ctrWrap, ctrLive, ctrDivider, ctrCaption], { opacity:0, y:12 });
gsap.set(textOrn,  { opacity:0, y:8 });
gsap.set(circleSvg, { opacity:0 });   /* círculo oculto al inicio */

/* ══════════════════════════════════════════════════════════════
   3. INICIALIZAR PATHS DEL ÁRBOL  ← AL CARGAR LA PÁGINA
   
   FIX #4: Llamamos esto AHORA, no dentro del timeline.
   Como #tree-layer tiene opacity:0 en CSS, nada se ve,
   pero los paths ya tienen strokeDashoffset correcto.
   Esto ELIMINA el bug de los círculos marrones.
══════════════════════════════════════════════════════════════ */
(function initTreePaths() {
  var paths = document.querySelectorAll('#tree-svg .treepath');
  paths.forEach(function(el) {
    try {
      var len = el.getTotalLength();
      /* Ocultar completamente el trazo */
      gsap.set(el, {
        strokeDasharray:  len,
        strokeDashoffset: len,
        opacity: 1           /* CSS lo tenía en 0; GSAP lo deja en 1 pero invisible por dashoffset */
      });
    } catch(e) { /* ignorar elementos sin getTotalLength */ }
  });
})();

/* ══════════════════════════════════════════════════════════════
   4. GENERAR HOJAS — FIX #5
   - Forma de corazón SVG (no oval)
   - Colores SÓLIDOS (sin opacity/transparencia)
   - 500 hojas para cubrir ramas completamente
   - Variación en color, tamaño e inclinación
══════════════════════════════════════════════════════════════ */
function generateLeaves() {
  var svgNS = 'http://www.w3.org/2000/svg';
  var SW = window.innerWidth;
  var SH = window.innerHeight;

  /* Centro del follaje: alineado con la copa del árbol */
  var cx = SW * 0.50;
  var cy = SH * 0.27;
  var R  = Math.min(SW, SH) * 0.235;   /* radio generoso para cubrir ramas */

  /* Paleta sólida — solo los colores correctos, sin alpha */
  var solidColors = [
    '#b50016', '#c8001c', '#d90429',
    '#e4102e', '#ef233c', '#f03858',
    '#ff4d6d', '#ff7090', '#ffb3c1',
    '#ffc8d0'
  ];

  /* Pesos para que los rojos intensos sean más frecuentes */
  var weights = [8, 10, 12, 11, 10, 8, 6, 5, 3, 2];
  var colorPool = [];
  solidColors.forEach(function(c, i) {
    for (var w = 0; w < weights[i]; w++) colorPool.push(c);
  });

  /* Path SVG del corazón (forma de corazón real, en viewBox 20×20) */
  var HEART_PATH =
    'M10,16 C10,16 1,10 1,6.5 C1,3.5 3.5,1.5 6,1.5' +
    ' C7.5,1.5 9,2.5 10,4 C11,2.5 12.5,1.5 14,1.5' +
    ' C16.5,1.5 19,3.5 19,6.5 C19,10 10,16 10,16Z';

  var NUM_LEAVES = 500;    /* FIX #5: suficientes para cubrir ramas */
  var allLeaves  = [];

  for (var i = 0; i < NUM_LEAVES; i++) {
    /* Distribución con ratio áureo → evita agrupaciones */
    var t = (i / NUM_LEAVES) * Math.PI * 2 + i * 0.618033;

    /* Fórmula paramétrica del corazón */
    var hx =  16 * Math.pow(Math.sin(t), 3);
    var hy = -(13 * Math.cos(t)
             -  5 * Math.cos(2*t)
             -  2 * Math.cos(3*t)
             -      Math.cos(4*t));

    var nx = hx / 16;
    var ny = hy / 13;

    /* Scatter: rellena el interior completo (0.05 a 1.08) */
    var sc  = 0.05 + Math.random() * 1.03;
    var nx2 = nx + (Math.random() - 0.5) * 0.18;
    var ny2 = ny + (Math.random() - 0.5) * 0.18;

    var lx = cx + nx2 * sc * R;
    var ly = cy + ny2 * sc * R * 0.94;
    var dist = Math.hypot(lx - cx, ly - cy);

    /* FIX #5: Tamaño variable entre 7 y 21px */
    var size = 7 + Math.random() * 14;

    /* FIX #5: Color sólido, sin degradado, sin opacidad variable */
    var color = colorPool[Math.floor(Math.random() * colorPool.length)];

    /* Crear SVG de hoja con forma de corazón */
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width',   size);
    svg.setAttribute('height',  size);
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.classList.add('leaf');
    svg.style.left       = lx + 'px';
    svg.style.top        = ly + 'px';
    svg.style.marginLeft = -(size / 2) + 'px';
    svg.style.marginTop  = -(size / 2) + 'px';

    /* Path con forma de corazón — color sólido, sin opacity */
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', HEART_PATH);
    path.setAttribute('fill', color);
    /* FIX #5: NO hay atributo opacity → totalmente sólido */

    svg.appendChild(path);
    leavesLayer.appendChild(svg);

    allLeaves.push({ el: svg, dist: dist });
  }

  /* Ordenar de adentro → afuera para stagger centrífugo */
  allLeaves.sort(function(a, b) { return a.dist - b.dist; });
  var sorted = allLeaves.map(function(l) { return l.el; });

  gsap.set(sorted, { scale:0, opacity:0 });
  gsap.to(sorted, {
    scale:   1,
    opacity: 1,
    /* FIX #5: Inclinación aleatoria (sin repetir el mismo ángulo) */
    rotate:  function() { return Math.random() * 360; },
    duration: 0.38,
    ease:    'back.out(1.5)',
    stagger: { each: 0.005, from: 'start' },  /* 0.005 × 500 = 2.5s de stagger */
  });
}

/* ══════════════════════════════════════════════════════════════
   5. TYPEWRITER  — FIX #6: más lento (68ms/carácter)
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
  var idx   = 0;

  function tick() {
    if (idx >= chars.length) {
      loveText.classList.remove('typing');
      if (onComplete) onComplete();
      return;
    }
    var ch = chars[idx++];
    loveText.innerHTML += (ch === '\n') ? '<br>' : ch;
    /* FIX #6: 68ms por carácter (era 36ms) */
    setTimeout(tick, ch === '\n' ? 200 : 68);
  }
  tick();
}

/* ══════════════════════════════════════════════════════════════
   6. CONTADOR  — FIX #1
   - Años/Meses/Días: estáticos, aparecen con animación
   - Horas/Minutos/Segundos: VIVOS, se actualizan cada segundo
══════════════════════════════════════════════════════════════ */
var LOVE_START = new Date(2021, 3, 12, 0, 0, 0);  /* 12 abril 2021, 00:00:00 */

function getTimeDiff() {
  var now = new Date();
  /* Calcular años/meses/días */
  var y = now.getFullYear() - LOVE_START.getFullYear();
  var m = now.getMonth()    - LOVE_START.getMonth();
  var d = now.getDate()     - LOVE_START.getDate();
  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) { y--; m += 12; }

  /* Calcular H/M/S desde el inicio del día actual */
  var totalSec = Math.floor((now - LOVE_START) / 1000);
  var s  = totalSec % 60;
  var mn = Math.floor((totalSec % 3600) / 60);
  var h  = Math.floor((totalSec % 86400) / 3600);

  return { y:y, m:m, d:d, h:h, mn:mn, s:s };
}

/* Anima un número de 0 → target con easing */
function animCounterUnit(id, target) {
  var el  = document.querySelector('#' + id + ' .cn');
  var obj = { v: 0 };
  gsap.to(obj, {
    v:        target,
    duration: 1.5,
    ease:     'power2.out',
    onUpdate:  function() { el.textContent = Math.round(obj.v); },
    onComplete: function() { el.textContent = target; },
  });
}

/* Actualiza los displays de H/M/S */
function updateLiveUnits() {
  var diff = getTimeDiff();
  var pad  = function(n) { return String(n).padStart(2, '0'); };
  document.getElementById('lv-h').textContent   = pad(diff.h);
  document.getElementById('lv-min').textContent = pad(diff.mn);
  document.getElementById('lv-s').textContent   = pad(diff.s);
}

var liveInterval = null;

function startCounter() {
  var diff = getTimeDiff();

  /* Años/meses/días con animación de conteo */
  animCounterUnit('cu-y', diff.y);
  setTimeout(function() { animCounterUnit('cu-m', diff.m); }, 320);
  setTimeout(function() { animCounterUnit('cu-d', diff.d); }, 600);

  /* FIX #1: H/M/S: actualización inmediata + tick cada segundo */
  updateLiveUnits();
  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(updateLiveUnits, 1000);
}

/* ══════════════════════════════════════════════════════════════
   7. CAÍDA DE HOJAS EN ZIG-ZAG (20 hojas aleatorias)
══════════════════════════════════════════════════════════════ */
function dropLeaves() {
  var all = Array.from(document.querySelectorAll('.leaf'));
  if (!all.length) return;

  /* Shuffle Fisher-Yates */
  for (var i = all.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
  }
  var chosen = all.slice(0, 20);
  var SH = window.innerHeight;

  chosen.forEach(function(leaf, k) {
    var sy      = parseFloat(leaf.style.top);
    var fallDist= SH - sy + 80;
    var swing   = 18 + Math.random() * 42;
    var dur     = 2.8 + Math.random() * 2.4;
    var delay   = k * 0.17 + Math.random() * 0.4;

    var tl = gsap.timeline({ delay: delay });
    tl.to(leaf, { y: fallDist, duration: dur, ease: 'power1.in' }, 0);
    tl.to(leaf, {
      x:        '+=' + swing,
      rotation: '+=' + (70 + Math.random() * 210),
      duration: dur / 4,
      ease:     'sine.inOut',
      repeat:   3, yoyo: true,
    }, 0);
    tl.to(leaf, { opacity:0, duration:0.9, ease:'power2.in' }, dur - 0.9);
  });
}

/* ══════════════════════════════════════════════════════════════
   8. TIMELINE MAESTRA — UN SOLO gsap.timeline()
══════════════════════════════════════════════════════════════ */
var started = false;

function runMasterTimeline() {
  if (started) return;
  started = true;

  /* ── FIX #6: Reproducir música ── */
  if (bgMusic) {
    bgMusic.currentTime = 0;
    bgMusic.volume = 0.85;
    bgMusic.play().catch(function() {
      /* Algunos browsers bloquean autoplay sin interacción adicional */
    });
  }

  /* ── Detener animación CSS del latido y del hint ── */
  heartSvg.style.animation = 'none';
  tapHint.style.animation  = 'none';
  /* Capturar opacidad actual del hint antes de que GSAP la tome */
  var hintCurrentOpacity = parseFloat(getComputedStyle(tapHint).opacity) || 0;
  gsap.set(tapHint, { opacity: hintCurrentOpacity });

  /* ─────────────────────────────────────────────────────────
     TIMELINE PRINCIPAL
  ───────────────────────────────────────────────────────── */
  var master = gsap.timeline();

  /* ══════════════════════════════════
     FASE 1 · MORPH CORAZÓN → CÍRCULO
     FIX #2: el círculo (r=34) es más
     pequeño que el corazón (r=44).
     morphWrap se encoge durante el morph.
  ══════════════════════════════════ */
  master
    /* Fade out del "Te amo" */
    .to(tapHint, { opacity:0, duration:0.35, ease:'power1.in' }, 0)

    /* Latido final antes del morph */
    .to(morphWrap, { scale:1.15, duration:0.18, ease:'power2.out' }, 0.08)
    .to(morphWrap, { scale:1.0,  duration:0.14, ease:'power2.in'  }, 0.26)

    /* FIX #2: crossfade + el wrap SE ENCOGE (simula que el corazón
       se contrae al convertirse en una pelota más pequeña) */
    .to(heartSvg, {
      opacity:  0,
      scale:    0.7,
      duration: 0.45,
      ease:     'power2.inOut',
    }, 0.42)
    .to(circleSvg, {
      opacity:  1,
      scale:    1,
      duration: 0.45,
      ease:     'power2.inOut',
    }, 0.42)
    /* El wrap completo también encoge un 20% durante la transformación */
    .to(morphWrap, {
      scale:    0.80,
      duration: 0.45,
      ease:     'power2.inOut',
    }, 0.42)
    .to(morphWrap, {
      scale:    1.0,
      duration: 0.12,
      ease:     'power1.out',
    }, 0.87)

    /* Squeeze vertical antes de caer */
    .to(morphWrap, {
      scaleY: 1.20, scaleX: 0.86,
      duration: 0.18, ease: 'power1.in',
    }, 0.94)

  /* ══════════════════════════════════
     FASE 2 · CAÍDA + SQUASH & STRETCH
  ══════════════════════════════════ */

    /* Mostrar suelo */
    .to(groundLine, {
      opacity: 1, scaleX: 1,
      transformOrigin: 'center',
      duration: 0.55, ease: 'power2.out',
    }, 1.05)

    /* CAÍDA LIBRE — la gota cae al suelo sin rebotar */
    .to(morphWrap, {
      y:        function() {
        /* Cae exactamente hasta la línea del suelo (bottom de pantalla) */
        return window.innerHeight / 2 - morphWrap.offsetHeight / 2 - 4;
      },
      scaleY:   1.0,
      scaleX:   1.0,
      duration: 0.55,
      ease:     'power2.in',
    }, 1.14)

    /* SPLAT al impacto: la gota se aplasta completamente en el suelo
       como una gota de agua — se expande horizontal y desaparece */
    .to(morphWrap, {
      scaleY:          0.0,
      scaleX:          2.2,
      transformOrigin: '50% 100%',
      opacity:         0,
      duration:        0.22,
      ease:           'power4.out',
    }, 1.69)

    /* Ocultar intro inmediatamente después del splat */
    .set(introLayer, { visibility:'hidden' }, 1.92)

  /* ══════════════════════════════════
     FASE 3 · ÁRBOL CRECE
     FIX #4: los paths ya fueron inicializados
     en el page load. Solo los animamos aquí.
  ══════════════════════════════════ */

    /* Mostrar capa del árbol — justo después del splat */
    .to(treeLayer, { opacity:1, duration:0.01 }, 1.95)

    /* TRONCO: brota desde el suelo (punto de impacto) */
    .to('#trunk1', {
      strokeDashoffset:0, duration:0.90, ease:'power2.inOut',
    }, 1.95)
    .to('#trunk2', {
      strokeDashoffset:0, duration:0.65, ease:'power2.inOut',
    }, 2.77)

    /* RAMAS: se extienden desde el tronco */
    .to(['#bl1','#br1'], {
      strokeDashoffset:0, duration:0.58, ease:'power2.out', stagger:0.06,
    }, 3.23)
    .to(['#bl2','#br2'], {
      strokeDashoffset:0, duration:0.52, ease:'power2.out', stagger:0.06,
    }, 3.53)
    .to(['#bl3','#br3'], {
      strokeDashoffset:0, duration:0.46, ease:'power2.out', stagger:0.06,
    }, 3.80)
    .to(['#bl4','#br4'], {
      strokeDashoffset:0, duration:0.40, ease:'power2.out', stagger:0.06,
    }, 4.05)

    /* Rama central (hacia arriba) */
    .to('#bcenter', {
      strokeDashoffset:0, duration:0.50, ease:'power2.out',
    }, 3.95)

    /* Ramitas terminales */
    .to(['#tw-l1a','#tw-l1b','#tw-l2a','#tw-l2b','#tw-l3',
         '#tw-r1a','#tw-r1b','#tw-r2a','#tw-r2b','#tw-r3','#tw-c'], {
      strokeDashoffset:0, duration:0.35, ease:'power1.out',
      stagger:{ each:0.04, from:'random' },
    }, 4.35)

  /* ══════════════════════════════════
     FASE 4 · FOLLAJE (500 hojas de corazón)
  ══════════════════════════════════ */
    .call(generateLeaves, null, 4.75)

  /* ══════════════════════════════════
     FASE 5 · DESPLAZAMIENTO + TEXTO
  ══════════════════════════════════ */

    /* Árbol + hojas se mueven a la derecha */
    .to(['#tree-layer','#leaves-layer'], {
      xPercent: 25,
      duration: 1.35,
      ease:     'power3.inOut',
    }, 8.1)

    /* Aparición del bloque de texto */
    .to(textLayer, { opacity:1, duration:0.45, ease:'power2.out' }, 8.75)
    .to(textOrn,   { opacity:1, y:0, duration:0.55, ease:'back.out(1.5)' }, 8.90)

    /* FIX #6: typewriter con 68ms/char empieza aquí */
    .call(function() {
      typewriterEffect(function() {
        /* Al terminar el texto: firma */
        gsap.to(loveSig, { opacity:1, y:0, duration:0.65, ease:'power2.out' });

        /* 450ms después: contador + live timer */
        setTimeout(function() {
          gsap.to([ctrDivider, ctrWrap], {
            opacity:1, y:0, duration:0.52, ease:'power2.out', stagger:0.15,
          });
          /* FIX #1: contador live aparece también */
          gsap.to(ctrLive, {
            opacity:1, y:0, duration:0.52, ease:'power2.out', delay:0.28,
          });
          gsap.to(ctrCaption, { opacity:0.7, duration:0.45, delay:0.42 });
          startCounter();   /* Inicia el tick de segundos */
        }, 460);
      });
    }, null, 9.30)

  /* ══════════════════════════════════
     FASE 6 · CAÍDA DE HOJAS (cierre)
  ══════════════════════════════════ */
    .call(dropLeaves, null, 13.5);

  return master;
}

/* ══════════════════════════════════════════════════════════════
   9. EVENTOS DE INICIO
══════════════════════════════════════════════════════════════ */
function handleStart(e) {
  if (e.type === 'touchend') e.preventDefault();
  runMasterTimeline();
}

morphWrap.addEventListener('click',    handleStart);
morphWrap.addEventListener('touchend', handleStart, { passive:false });

/* ══════════════════════════════════════════════════════════════
   10. PARALLAX SUTIL EN DESKTOP (solo después del texto)
══════════════════════════════════════════════════════════════ */
var parallaxReady = false;
setTimeout(function() { parallaxReady = true; }, 11500);

document.addEventListener('mousemove', function(e) {
  if (!parallaxReady || !started) return;
  var dx = (e.clientX / window.innerWidth  - 0.5) * 5;
  var dy = (e.clientY / window.innerHeight - 0.5) * 3;
  gsap.to(['#tree-layer','#leaves-layer'], {
    x: '+=' + (dx * 0.05),
    y: '+=' + (dy * 0.05),
    duration: 1.2, ease:'power1.out', overwrite:'auto',
  });
});
