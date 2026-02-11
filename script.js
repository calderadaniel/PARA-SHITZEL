const startHeart = document.getElementById("startHeart");
const startScreen = document.getElementById("startScreen");
const scene = document.getElementById("scene");
const ground = document.getElementById("ground");
const treePath = document.getElementById("treePath");
const treeContainer = document.getElementById("treeContainer");
const heartsContainer = document.getElementById("heartsContainer");
const music = document.getElementById("music");
const timer = document.getElementById("timer");
const letter = document.getElementById("letter");

startHeart.addEventListener("click", () => {

    // TRANSFORM TO CIRCLE
    startHeart.style.borderRadius="50%";
    startHeart.style.transform="none";
    startHeart.style.width="60px";
    startHeart.style.height="60px";

    // DRAW GROUND BEFORE TOUCH
    setTimeout(()=>{
        ground.style.transition="1s ease";
        ground.style.width="100%";
    },300);

    // FALL
    startHeart.style.position="absolute";
    startHeart.style.top="40%";

    setTimeout(()=>{
        startHeart.style.transition="1s ease-in";
        startHeart.style.top="80%";
    },300);

    setTimeout(()=>{
        startScreen.style.display="none";
        scene.style.display="block";
        startAnimation();
    },1400);
});

function startAnimation(){

    // MUSIC
    music.currentTime=0;
    music.volume=0;
    music.play();

    let fadeIn = setInterval(()=>{
        if(music.volume < 1){
            music.volume += 0.05;
        } else clearInterval(fadeIn);
    },200);

    // DRAW TREE
    treePath.style.transition="3s ease";
    treePath.style.strokeDashoffset="0";

    setTimeout(()=>{
        createHeartLeaves();
    },3000);

    setTimeout(()=>{
        treeContainer.style.left="65%";
        showTimer();
        writeLetter();
    },6000);
}

function createHeartLeaves(){
    for(let i=0;i<120;i++){
        let heart=document.createElement("div");
        heart.className="heartLeaf";
        heart.innerHTML="❤";
        heart.style.color=randomColor();
        heart.style.left=Math.random()*200+"px";
        heart.style.top=Math.random()*200+"px";
        heart.style.fontSize=(14+Math.random()*20)+"px";
        heart.style.transform=`rotate(${Math.random()*360}deg)`;
        heartsContainer.appendChild(heart);
    }
}

function randomColor(){
    const colors=["#ff4d6d","#ff758f","#ff8fa3","#ffb3c1","#fb6f92"];
    return colors[Math.floor(Math.random()*colors.length)];
}

function showTimer(){
    const startDate=new Date("2023-01-01T00:00:00");

    setInterval(()=>{
        const now=new Date();
        const diff=now-startDate;

        const days=Math.floor(diff/(1000*60*60*24));
        const hours=Math.floor(diff/(1000*60*60)%24);
        const minutes=Math.floor(diff/(1000*60)%60);
        const seconds=Math.floor(diff/1000%60);

        timer.innerHTML=`
        Mi amor por ti comenzó hace:<br>
        <strong>${days}</strong> días 
        ${hours} horas 
        ${minutes} minutos 
        ${seconds} segundos
        `;
    },1000);
}

function writeLetter(){
    const text=`Para el amor de mi vida:

Si pudiera elegir un lugar seguro,
sería a tu lado.

Cuanto más tiempo estoy contigo,
más te amo.

— I Love You!`;

    let i=0;
    let speed=40;

    function typing(){
        if(i<text.length){
            letter.innerHTML+=text.charAt(i);
            i++;
            setTimeout(typing,speed);
        }
    }

    typing();
}
