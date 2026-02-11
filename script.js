const heart = document.getElementById("heart");
const intro = document.getElementById("intro");
const scene = document.getElementById("scene");
const music = document.getElementById("bgMusic");
const timerContainer = document.getElementById("timerContainer");
const timer = document.getElementById("timer");

const startDate = new Date("2023-02-14T00:00:00");

heart.addEventListener("click", () => {

  intro.style.display = "none";
  scene.classList.remove("hidden");

  music.currentTime = 0;
  music.play();

  startTimer();
});

function startTimer() {
  setInterval(() => {
    const now = new Date();
    const diff = now - startDate;

    const years = Math.floor(diff / (1000*60*60*24*365));
    const months = Math.floor(diff / (1000*60*60*24*30));
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor(diff / (1000*60*60)) % 24;
    const minutes = Math.floor(diff / (1000*60)) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    timer.innerHTML =
      years + " años " +
      months + " meses " +
      days + " días " +
      hours + "h " +
      minutes + "m " +
      seconds + "s";
  }, 1000);

  timerContainer.classList.remove("hidden");
}
