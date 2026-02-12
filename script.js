const tl = gsap.timeline();

// Calcular días desde fecha específica
function calcularDias() {
  const inicio = new Date("2021-06-01");
  const hoy = new Date();
  const diff = hoy - inicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// FASE 1 — Dibujar tronco
gsap.set("#trunk", { drawSVG: "0%" });

// Animar trazo manual
tl.fromTo("#trunk",
  { strokeDasharray: 400, strokeDashoffset: 400 },
  { strokeDashoffset: 0, duration: 2, ease: "power2.out" }
);

// FASE 2 — Aparecen hojas
tl.from(".leaf", {
  scale: 0,
  opacity: 0,
  stagger: 0.2,
  duration: 0.6,
  ease: "back.out(1.7)"
});

// FASE 3 — Contador
tl.to("#counter", {
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
});

// FASE 4 — Mensaje final
tl.to("#message", {
  opacity: 1,
  duration: 1,
  y: -10
});
