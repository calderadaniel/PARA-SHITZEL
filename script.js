document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // CONFIGURACIÓN Y ELEMENTOS
  // ==========================================================================
  const morphShape = document.getElementById('morph-shape');
  const shapePath = document.getElementById('shape-path');
  const introTitle = document.getElementById('intro-title');
  const heartWrapper = document.getElementById('heart-wrapper');
  const introLayer = document.getElementById('intro-layer');
  const music = document.getElementById('music');
  const branches = document.querySelectorAll('.branch');
  const leavesContainer = document.getElementById('leaves-container');
  const finalText = document.getElementById('final-text');

  // Paths para morphing perfecto sin librerías externas
  const pathHeart = "M 50,30 C 75,10 95,30 80,55 C 65,80 50,90 50,90 C 50,90 35,80 20,55 C 5,30 25,10 50,30";
  const pathCircle = "M 50,10 C 72.09,10 90,27.91 90,50 C 90,72.09 72.09,90 50,90 C 27.91,90 10,72.09 10,50 C 10,27.91 27.91,10 50,10";

  // Fecha solicitada: 12 de abril de 2021
  const startDate = new Date('2021-04-12T00:00:00');
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Preparar SVG paths para animación tipo DrawSVG
  branches.forEach(branch => {
    const length = branch.getTotalLength();
    gsap.set(branch, { strokeDasharray: length, strokeDashoffset: length });
  });

  // Generación algorítmica de hojas en copa de árbol (Forma de corazón)
  const leavesCount = 150;
  const leaves = [];
  const centerX = 125; // Mitad del contenedor de 250px
  const topOffset = 100; // Altura de la copa
  const colors = ['#d90429', '#ef233c', '#ff8fa3', '#ffb3c1']; // Paleta del video

  for (let i = 0; i < leavesCount; i++) {
    const t = Math.random() * Math.PI * 2;
    // Ecuación paramétrica de corazón
    const s = 6; 
    const xBase = s * 16 * Math.pow(Math.sin(t), 3);
    const yBase = -s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    
    // Dispersión aleatoria para dar volumen natural
    const noiseX = (Math.random() - 0.5) * 20;
    const noiseY = (Math.random() - 0.5) * 20;

    const leaf = document.createElement('div');
    leaf.classList.add('leaf');
    leaf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    leaf.style.left = `${centerX + xBase + noiseX}px`;
    leaf.style.top = `${topOffset + yBase + noiseY}px`;
    
    // Guardar rotación base
    const baseRot = -45 + (Math.random() * 30 - 15);
    leaf.dataset.rot = baseRot;
    
    leavesContainer.appendChild(leaf);
    leaves.push(leaf);
  }

  // Typewriter setup (separar letras)
  const textContent = finalText.innerHTML;
  finalText.innerHTML = '';
  const parts = textContent.split(/(<br>)/);
  parts.forEach(part => {
    if(part === '<br>') {
      finalText.appendChild(document.createElement('br'));
    } else {
      part.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'char';
        finalText.appendChild(span);
      });
    }
  });
  const charElements = document.querySelectorAll('.char');

  // ==========================================================================
  // MASTER TIMELINE (Una sola línea de tiempo)
  // ==========================================================================
  const tl = gsap.timeline({ paused: true });

  // FASE 1: Animación inicial pulsante
  tl.fromTo(heartWrapper, 
    { scale: 0 }, 
    { scale: 1.15, duration: 1, ease: "power2.out" }
  )
  .to(heartWrapper, { scale: 1, duration: 0.5, ease: "power1.inOut" })
  .fromTo(introTitle, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8 }, "-=0.5");

  tl.addPause("interaction"); // Espera al click

  // FASE 2: Morphing y desaparición del texto
  tl.to(introTitle, { opacity: 0, duration: 0.5 }, "morph")
  .to(introLayer, { gap: 0, duration: 0.5 }, "morph")
  // Transformar el corazón en círculo perfecto
  .to(shapePath, { attr: { d: pathCircle }, duration: 1.2, ease: "power2.inOut" }, "morph");

  // FASE 3 y 4: Caída, aparición de línea e impacto
  // Calculamos la caída hasta tocar el suelo (bottom: 20%)
  tl.to(introLayer, { 
    y: (window.innerHeight * 0.3), 
    ease: "power2.in", 
    duration: 1 
  }, "fall")
  .to("#ground-line", { scaleX: 1, duration: 0.6, ease: "power2.out" }, "fall+=0.4")
  
  // Impacto (squash y rebote físico)
  .to(heartWrapper, { scaleY: 0.85, scaleX: 1.15, transformOrigin: "bottom", duration: 0.15, ease: "power1.out" })
  .to(heartWrapper, { scaleY: 1, scaleX: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" })
  .to(introLayer, { opacity: 0, duration: 0.3 }, "-=0.2");

  // FASE 5: Árbol (Replicando DrawSVG)
  tl.to(branches, { 
    strokeDashoffset: 0, 
    duration: 5, 
    stagger: 0.4, // Crece secuencialmente, el tronco primero, luego las ramas
    ease: "power2.inOut" 
  }, "tree");

  // FASE 6: Copa de Hojas (Corazón gigante)
  tl.to(leaves, {
    scale: 1,
    opacity: 1,
    rotation: (i, el) => el.dataset.rot, // Restaurar su rotación natural (-45deg aprox)
    duration: 1.5,
    stagger: {
      amount: 4, 
      from: "center" // Crecen desde el centro hacia afuera
    },
    ease: "back.out(1.5)"
  }, "tree+=2.5");

  // FASE 7: Desplazamiento Sutil a la Derecha (para dar lugar al texto a la izquierda)
  tl.to("#tree-container", {
    x: "20%", // Se mueve un poco hacia la derecha
    duration: 3.5, 
    ease: "sine.inOut"
  });

  // FASE 8: Texto y Contador (Apareciendo a la izquierda, replicando distribución)
  const counterObj = { y: 0, m: 0, d: 0 };
  tl.to("#text-content", { opacity: 1, duration: 1 }, "counterStart")
  .to(counterObj, {
    y: years,
    m: months,
    d: days,
    duration: 2.5,
    ease: "power2.out",
    onUpdate: () => {
      document.getElementById('c-years').innerText = Math.floor(counterObj.y);
      document.getElementById('c-months').innerText = Math.floor(counterObj.m);
      document.getElementById('c-days').innerText = Math.floor(counterObj.d);
    }
  }, "counterStart");

  // FASE 9: Typewriter del poema (0.05s por letra)
  tl.to(charElements, {
    opacity: 1,
    duration: 0.05,
    stagger: 0.05, 
    ease: "none"
  }, "textSequence");

  // FASE 10: Caída Sutil de algunas hojas al azar
  const fallingLeaves = leaves.sort(() => 0.5 - Math.random()).slice(0, 15); // Solo 15 hojas
  tl.to(fallingLeaves, {
    y: () => "+=" + (Math.random() * 250 + 100), // Caen hacia el suelo
    x: () => "+=" + ((Math.random() - 0.5) * 150), // Brisa
    rotation: () => "+=" + (Math.random() * 360), // Giran en el aire
    opacity: 0,
    duration: () => Math.random() * 3 + 3,
    stagger: {
      amount: 6,
      from: "random"
    },
    ease: "power1.in"
  }, "leafFall");

  // ==========================================================================
  // INICIO E INTERACCIÓN
  // ==========================================================================
  
  // Arranca Fase 1
  tl.play();

  // Escuchar toque para iniciar Fase 2 (Música + Morphing)
  heartWrapper.addEventListener('click', () => {
    heartWrapper.style.pointerEvents = "none";
    
    // Fade IN de la música (2 segundos exactos)
    music.volume = 0;
    music.play().catch(e => console.log("Auto-play prevenido, se requiere interacción."));
    gsap.to(music, { volume: 1, duration: 2 });

    // Continuar desde el punto de pausa
    tl.play();
  });
});
