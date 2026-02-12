const tl = gsap.timeline();

// Crear hojas formando corazón
function createHeartLeaves() {
  const leavesGroup = document.getElementById("leaves");

  for (let t = 0; t < Math.PI * 2; t += 0.15) {

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    const leaf = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    leaf.setAttribute("cx", 250 + x * 6);
    leaf.setAttribute("cy", 240 - y * 6);
    leaf.setAttribute("r", 5);
    leaf.setAttribute("fill", "#ff4d6d");
    leaf.setAttribute("class", "leaf");

    leavesGroup.appendChild(leaf);
  }
}

createHeartLeaves();

// Preparar dibujo
gsap.set("#trunk, #branches path", {
  strokeDasharray: 1000,
  strokeDashoffset: 1000
});

gsap.set(".leaf", { scale: 0, opacity: 0 });

// === SECUENCIA ===

// 1️⃣ Caída
tl.to("#drop", {
  y: 370,
  duration: 1.5,
  ease: "power2.in"
});

// 2️⃣ Línea horizontal
tl.to("#groundLine", {
  attr: { x1: 200, x2: 300 },
  duration: 0.6
});

// 3️⃣ Dibujar tronco
tl.to("#trunk", {
  strokeDashoffset: 0,
  duration: 2
});

// 4️⃣ Dibujar ramas
tl.to("#branches path", {
  strokeDashoffset: 0,
  duration: 1.5,
  stagger: 0.3
});

// 5️⃣ Aparecen hojas formando corazón
tl.to(".leaf", {
  scale: 1,
  opacity: 1,
  stagger: 0.03,
  duration: 0.3,
  ease: "back.out(1.7)"
});

// 6️⃣ Desplazamiento lateral
tl.to("#treeGroup", {
  x: -60,
  duration: 1.5
});

// 7️⃣ Contador
function calcularDias() {
  const inicio = new Date("2021-04-12");
  const hoy = new Date();
  return Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
}

tl.to("#counter", {
  opacity: 1,
  duration: 1,
  onStart: () => {
    let dias = calcularDias();
    gsap.to({ val: 0 }, {
      val: dias,
      duration: 2,
      onUpdate: function () {
        document.getElementById("counter").innerText =
          Math.floor(this.targets()[0].val) + " días";
      }
    });
  }
});

// 8️⃣ Texto
tl.to("#message", {
  opacity: 1,
  duration: 1
});

// 9️⃣ Hojas cayendo
tl.to(".leaf", {
  y: "+=300",
  opacity: 0,
  stagger: 0.05,
  duration: 3,
  ease: "power1.in"
});
