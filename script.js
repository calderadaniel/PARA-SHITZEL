const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

/* ========= CREAR HOJAS ========= */

function createHeartLeaves() {
  const leavesGroup = document.getElementById("leaves");
  leavesGroup.innerHTML = "";

  for (let t = 0; t < Math.PI * 2; t += 0.09) {

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    const leaf = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    leaf.setAttribute("cx", 250 + x * 5.8 + (Math.random() - 0.5) * 6);
    leaf.setAttribute("cy", 240 - y * 5.8 + (Math.random() - 0.5) * 6);
    leaf.setAttribute("r", 4.5);
    leaf.setAttribute("fill", "#ff4d6d");
    leaf.setAttribute("class", "leaf");

    leavesGroup.appendChild(leaf);
  }
}

createHeartLeaves();

/* ========= PREPARAR DIBUJO ========= */

const paths = document.querySelectorAll("#trunk, #branches path");

paths.forEach(p => {
  const length = p.getTotalLength();
  gsap.set(p, {
    strokeDasharray: length,
    strokeDashoffset: length
  });
});

gsap.set(".leaf", { scale: 0, opacity: 0 });

/* ========= TIMELINE ========= */

// 1 Caída
tl.to("#drop", {
  y: 370,
  duration: 1.4,
  ease: "power2.in"
})

// 2 Línea desde centro
.to("#groundLine", {
  attr: { x1: 180, x2: 320 },
  duration: 0.6
})

// 3 Dibujar tronco
.to("#trunk", {
  strokeDashoffset: 0,
  duration: 2
})

// 4 Dibujar ramas
.to("#branches path", {
  strokeDashoffset: 0,
  duration: 1.5,
  stagger: 0.25
})

// 5 Hojas aparecen
.to(".leaf", {
  scale: 1,
  opacity: 1,
  stagger: 0.015,
  duration: 0.4,
  ease: "back.out(2)"
})

// 6 Movimiento lateral
.to("#treeGroup", {
  x: -50,
  duration: 1.5
})

// 7 Pausa
.to({}, { duration: 0.7 })

// 8 Contador
.to("#counter", {
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
})

// 9 Texto
.to("#message", {
  opacity: 1,
  duration: 1
})

// 10 Hojas caen natural
.to(".leaf", {
  y: "+=350",
  x: () => (Math.random() * 120 - 60),
  rotation: () => Math.random() * 180,
  opacity: 0,
  stagger: {
    each: 0.03,
    from: "random"
  },
  duration: 3,
  ease: "power1.in"
});


function calcularDias() {
  const inicio = new Date("2021-04-12");
  const hoy = new Date();
  return Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
}
