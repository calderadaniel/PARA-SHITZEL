const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

/* =========================
   🌿 CREAR CORAZÓN ORGÁNICO
========================= */

function createHeartLeaves() {
  const leavesGroup = document.getElementById("leaves");

  for (let t = 0; t < Math.PI * 2; t += 0.07) {

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    // Variación orgánica
    const randomOffsetX = (Math.random() - 0.5) * 8;
    const randomOffsetY = (Math.random() - 0.5) * 8;

    const leaf = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    leaf.setAttribute("cx", 250 + x * 6 + randomOffsetX);
    leaf.setAttribute("cy", 240 - y * 6 + randomOffsetY);
    leaf.setAttribute("r", 4 + Math.random() * 2);
    leaf.setAttribute("fill", "#ff4d6d");
    leaf.setAttribute("class", "leaf");

    leavesGroup.appendChild(leaf);
  }
}

createHeartLeaves();

/* =========================
   🌳 MEJORAR TRONCO VISUAL
========================= */

// Tronco más orgánico
document.getElementById("trunk").setAttribute(
  "d",
  "M250 450 C235 390 270 340 250 300 C230 260 270 220 250 180 C240 150 255 130 250 110"
);

/* =========================
   🎬 PREPARACIÓN
========================= */

gsap.set("#trunk, #branches path", {
  strokeDasharray: 1200,
  strokeDashoffset: 1200
});

gsap.set(".leaf", { scale: 0, opacity: 0 });

/* =========================
   1️⃣ CAÍDA CON IMPACTO
========================= */

tl.to("#drop", {
  y: 370,
  duration: 1.4,
  ease: "power2.in"
})

.to("#drop", {
  scaleY: 0.6,
  scaleX: 1.4,
  duration: 0.15,
  yoyo: true,
  repeat: 1
})

/* =========================
   2️⃣ LÍNEA CON EXPANSIÓN
========================= */

.to("#groundLine", {
  attr: { x1: 180, x2: 320 },
  duration: 0.6,
  ease: "back.out(2)"
})

/* =========================
   3️⃣ TRONCO
========================= */

.to("#trunk", {
  strokeDashoffset: 0,
  duration: 2.2
})

/* =========================
   4️⃣ RAMAS CON LIGERO DESFASE
========================= */

.to("#branches path", {
  strokeDashoffset: 0,
  duration: 1.6,
  stagger: 0.25
})

/* =========================
   5️⃣ CORAZÓN CON PROFUNDIDAD
========================= */

.to(".leaf", {
  scale: 1,
  opacity: 1,
  stagger: 0.01,
  duration: 0.4,
  ease: "back.out(2)"
})

/* =========================
   6️⃣ DESPLAZAMIENTO MÁS SUAVE
========================= */

.to("#treeGroup", {
  x: -55,
  duration: 1.8,
  ease: "power3.inOut"
})

/* =========================
   7️⃣ CONTADOR CON PAUSA EMOCIONAL
========================= */

.to({}, { duration: 0.8 }) // pequeña pausa

.to("#counter", {
  opacity: 1,
  duration: 1,
  onStart: () => {
    let dias = calcularDias();
    gsap.to({ val: 0 }, {
      val: dias,
      duration: 2,
      ease: "power1.out",
      onUpdate: function () {
        document.getElementById("counter").innerText =
          Math.floor(this.targets()[0].val) + " días";
      }
    });
  }
})

/* =========================
   8️⃣ TEXTO
========================= */

.to("#message", {
  opacity: 1,
  y: -8,
  duration: 1
})

/* =========================
   9️⃣ HOJAS CAYENDO NATURAL
========================= */

.to(".leaf", {
  y: "+=350",
  x: "+=" + (Math.random() * 100 - 50),
  rotation: () => Math.random() * 180,
  opacity: 0,
  stagger: {
    each: 0.03,
    from: "random"
  },
  duration: 3,
  ease:
