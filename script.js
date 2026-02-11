const startScreen = document.getElementById("startScreen");
const heartStart = document.getElementById("heartStart");
const mainScene = document.getElementById("mainScene");
const ground = document.getElementById("ground");
const treePath = document.getElementById("treePath");
const treeSVG = document.getElementById("treeSVG");
const music = document.getElementById("music");
const contador = document.getElementById("contador");
const dedicatoria = document.getElementById("dedicatoria");

heartStart.addEventListener("click", () => {
  heartStart.classList.add("drop");
  setTimeout(() => {
    startScreen.style.display = "none";
    mainScene.style.display = "flex";
    startAnimation();
  }, 1000);
});

function startAnimation() {

  setTimeout(() => {
    ground.classList.add("showGround");
  }, 300);

  setTimeout(() => {
    treePath.classList.add("drawTree");
  }, 1200);

  setTimeout(() => {
    createHearts();
  }, 5000);

  setTimeout(() => {
    treeSVG.classList.add("moveRight");
    showCounter();
  }, 9000);

  setTimeout(() => {
    typeText();
  }, 11000);

  music.play();
  music.volume = 0;
  let fade = setInterval(()=>{
    if(music.volume < 1){
      music.volume += 0.05;
    } else {
      clearInterval(fade);
    }
  },200);
}

function createHearts(){
  for(let i=0;i<60;i++){
    let heart = document.createElement("div");
    heart.classList.add("leaf");
    heart.style.left = (150 + Math.random()*100)+"px";
    heart.style.top = (100 + Math.random()*200)+"px";
    heart.style.background = randomPink();
    heart.style.transform = `rotate(${Math.random()*360}deg) scale(${0.5+Math.random()})`;
    document.getElementById("rightTree").appendChild(heart);

    if(i%3===0){
      setTimeout(()=> fallHeart(heart), 8000 + Math.random()*5000);
    }
  }
}

function fallHeart(el){
  el.classList.add("fall");
}

function randomPink(){
  const colors = ["#ff9eb5","#ff7fa5","#ffb3c7","#ff6f91","#ff8fab"];
  return colors[Math.floor(Math.random()*colors.length)];
}

function showCounter(){
  const startDate = new Date("2021-04-12T00:00:00");
  setInterval(()=>{
    const now = new Date();
    let diff = now - startDate;

    let seconds = Math.floor(diff/1000);
    let minutes = Math.floor(seconds/60);
    let hours = Math.floor(minutes/60);
    let days = Math.floor(hours/24);
    let years = Math.floor(days/365);
    let months = Math.floor((days%365)/30);

    contador.innerHTML = `
    <div class="counterBox">Mi amor por ti comenzó hace:</div>
    <div class="time">
    ${years} años ${months} meses ${days%30} días
    ${hours%24}h ${minutes%60}m ${seconds%60}s
    </div>`;
  },1000);
}

function typeText(){
  const text = `PARA MI TODO SHITZEL

Para la persona que me hizo recordar cómo se siente el amor:

Si me dieran a elegir el lugar para estar el resto de mi vida,
sería abrazado a tu cuerpo,
viéndonos a los ojos por toda la eternidad.

P.D. I love you ❤️`;

  let i=0;
  let interval = setInterval(()=>{
    dedicatoria.innerHTML += text[i];
    i++;
    if(i>=text.length){
      clearInterval(interval);
    }
  },50);
}
