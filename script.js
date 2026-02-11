const heart = document.getElementById("heart");
const intro = document.getElementById("intro");
const scene = document.getElementById("scene");
const ground = document.getElementById("ground");
const treeSVG = document.getElementById("treeSVG");
const timerBox = document.getElementById("timerBox");
const timer = document.getElementById("timer");
const textContainer = document.getElementById("textContainer");
const music = document.getElementById("bgMusic");

const startDate = new Date("2023-02-14T00:00:00");

let leaves = [];

heart.addEventListener("click", startSequence);

function startSequence(){

intro.style.display="none";
scene.classList.remove("hidden");

animateGround();
dropCircle();

setTimeout(drawTree,1000);
setTimeout(addLeaves,3000);
setTimeout(moveTreeAndTimer,6000);
setTimeout(startText,7000);

music.currentTime=0;
music.play();
}

function animateGround(){
ground.style.transition="width 1s ease";
ground.style.width="100%";
}

function dropCircle(){
heart.style.transition="all 1s ease";
heart.style.transform="translateY(400px)";
}

function drawTree(){

treeSVG.innerHTML="";

const trunk=document.createElementNS("http://www.w3.org/2000/svg","path");
trunk.setAttribute("d","M300 700 L300 450");
trunk.setAttribute("stroke","#8b5e3c");
trunk.setAttribute("stroke-width","12");
trunk.setAttribute("fill","none");
treeSVG.appendChild(trunk);

}

function addLeaves(){

for(let i=0;i<60;i++){

let leaf=document.createElement("div");
leaf.innerHTML="❤";
leaf.style.position="absolute";
leaf.style.left=(250+Math.random()*200)+"px";
leaf.style.top=(200+Math.random()*200)+"px";
leaf.style.color=randomPink();
leaf.style.fontSize=(20+Math.random()*25)+"px";
leaf.style.transform="rotate("+(Math.random()*360)+"deg)";
treeSVG.parentElement.appendChild(leaf);

leaves.push(leaf);
}
}

function moveTreeAndTimer(){
treeSVG.style.transform="translateX(100px)";
timerBox.classList.remove("hidden");
startTimer();
startFalling();
}

function startTimer(){
setInterval(()=>{
const now=new Date();
const diff=now-startDate;

const years=Math.floor(diff/(1000*60*60*24*365));
const months=Math.floor(diff/(1000*60*60*24*30));
const days=Math.floor(diff/(1000*60*60*24));
const hours=Math.floor(diff/(1000*60*60))%24;
const minutes=Math.floor(diff/(1000*60))%60;
const seconds=Math.floor(diff/1000)%60;

timer.innerHTML=`${years} años ${months} meses ${days} días ${hours}h ${minutes}m ${seconds}s`;
},1000);
}

function startText(){

const message=`PARA MI TODO SHITZEL

Para la persona que me hizo recordar como se siente el amor:

Si me dieran a elegir el lugar para estar el resto de mi vida,
sería abrazado a tu cuerpo,
viéndonos a los ojos por toda la eternidad.

P.D. I love you`;

let i=0;

let interval=setInterval(()=>{
textContainer.innerHTML+=message[i];
i++;
if(i>=message.length){
clearInterval(interval);
}
},50);

}

function startFalling(){
setInterval(()=>{
let leaf=leaves[Math.floor(Math.random()*leaves.length)];
leaf.classList.add("falling");
},1500);
}

function randomPink(){
const colors=["#ffb6c1","#ff69b4","#ff1493","#ff8da1","#ff4d6d"];
return colors[Math.floor(Math.random()*colors.length)];
}
