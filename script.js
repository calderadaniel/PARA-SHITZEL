// ===== MÚSICA =====
document.body.addEventListener("click", function() {
    document.getElementById("music").play();
}, { once: true });


// ===== CREAR ÁRBOL DE CORAZONES =====
const heartsContainer = document.querySelector(".hearts");

for (let i = 0; i < 120; i++) {

    const heart = document.createElement("div");
    heart.classList.add("heart");

    heart.style.left = Math.random() * 260 + "px";
    heart.style.top = Math.random() * 260 + "px";

    heart.style.background = 
        ["#ff4d6d", "#ff758f", "#ff8fa3", "#ffb3c6", "#ffccd5"]
        [Math.floor(Math.random() * 5)];

    heart.style.animationDuration = (2 + Math.random() * 2) + "s";

    heartsContainer.appendChild(heart);
}


// ===== TEMPORIZADOR =====
const startDate = new Date("2023-01-01T00:00:00"); // CAMBIA ESTA FECHA

function updateTimer() {

    const now = new Date();
    const diff = now - startDate;

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    document.getElementById("timer").innerHTML =
        `${days} días ${hours} horas ${minutes} minutos ${seconds} segundos`;
}

setInterval(updateTimer, 1000);
updateTimer();
