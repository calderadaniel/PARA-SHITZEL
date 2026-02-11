const heartBtn = document.getElementById("heartButton");
const startScreen = document.getElementById("startScreen");
const container = document.querySelector(".container");
const music = document.getElementById("music");

heartBtn.addEventListener("click", () => {

    music.play().catch(() => {});

    heartBtn.classList.add("circle");

    setTimeout(() => {
        heartBtn.classList.add("fall");
    }, 400);

    setTimeout(() => {
        startScreen.style.display = "none";
        container.classList.remove("hidden");
        createTree();
    }, 1800);
});


/* ===== CREAR ÁRBOL REAL EN FORMA DE CORAZÓN ===== */
function createTree() {

    const canopy = document.getElementById("canopy");

    for (let i = 0; i < 180; i++) {

        const heart = document.createElement("div");
        heart.classList.add("heart");

        const t = Math.random() * Math.PI * 2;

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) 
                - 5 * Math.cos(2*t) 
                - 2 * Math.cos(3*t) 
                - Math.cos(4*t);

        const scale = 12;

        heart.style.left = 180 + x * scale + "px";
        heart.style.top = 160 - y * scale + "px";

        heart.style.background =
            ["#ff4d6d","#ff758f","#ff8fa3","#ffb3c6","#ffccd5"]
            [Math.floor(Math.random()*5)];

        canopy.appendChild(heart);
    }
}


/* ===== TEMPORIZADOR ===== */
const startDate = new Date("2023-01-01T00:00:00");

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
