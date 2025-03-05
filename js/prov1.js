let playing = false;
let sections = ["newgame","gimage","gcontrols"];
//let theWord = "test";
let guessedCars = 0;
let errNum = 0;
const letters = document.querySelectorAll("#gchars > span");
const MAXERR = 7;

function initialView() {
    sections.forEach((elem) => {
        let sec = document.getElementById(elem);
        sec.classList.remove("playing");
        sec.classList.add("notplaying");
    });
}

async function fetchWord() {
    //let newWord = "";
    //let resp = await fetch("http://quoridorarena.ps8.academy/newGame").then((res)=>res.json()).then(function(Data){console.log(Data);});///////////////
    //const wordLength=resp.wordLength;
    //const gameId=resp.gameId;
    //return resp;
    //try {
        //let resp = await fetch("https://trouve-mot.fr/api/random");
        let resp = await fetch("http://quoridorarena.ps8.academy/newGame").then((res)=>res.json())//.then(function(Data){console.log(Data);});///////////////
        const wordLength=resp["wordLength"];
        const gameId=resp["gameId"];
        //if (!resp.ok) {
         //  console.error("Bad response from the server");
        //}
        //const data = await resp.json();
        //newWord = data[0]["name"];
   // } catch (error) {
        //console.error("error", error);
    //}
    //return newWord;
    return [wordLength, gameId];
}


async function initHtmlW2guess() {
    let gameData = await fetchWord();
    wordLength=gameData[0];
    gameId= gameData[1];
    //theWord = theWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    //console.log(`Got "${theWord}"`);

    let w2gempty = "";
    let w2g = document.getElementById("word2guess");
    for (let i = 0; i < wordLength; i++)
        w2gempty += "_";
    w2gempty = w2gempty.split("");
    w2g.innerText = w2gempty.join(" ");
}


function newGame() {
    console.log("new game");

    for(let i = 0; i < sections.length; i++) {
        let sec = document.getElementById(sections[i]);
        sec.classList.remove("notplaying");
        sec.classList.add("playing");
    }
    
    initHtmlW2guess();

    playing = true;
    guessedCars = 0;
    errNum = 0;
    for(let i = 0; i < letters.length; i++) {
        letters[i].classList.remove("ok");
        letters[i].classList.remove("ko");
    }
    for(let i = 1; i <= MAXERR; i++ ) {
        let errstep = document.getElementById("i"+i);
        errstep.classList.remove("err");
    }
}

function addGameEvents() {
    let ngb = document.getElementById(sections[0]);
    ngb.addEventListener("click", newGame);
    let rb = document.getElementById("restartb");
    rb.addEventListener("click", newGame);

    letters.forEach((letter) => {
        letter.addEventListener("click",(event) => {
            tryCar(event.currentTarget.innerText);
        });
    });
}

window.addEventListener("load", (event) => {
    initialView();
    addGameEvents();
});

function tryCar(car) {
    if (!playing) return;
    
    let w2g = document.getElementById("word2guess");
    let w2gempty = w2g.innerText.split(" ");
    let found = false;
    for(let i = 0; i < wordLength; i++) {
        if (theWord[i] === car) {
            found = true;
            w2gempty[i] = car;
            guessedCars++;
            if (guessedCars === theWord.length) {
                playing = false;
                break;
            }
        }
    }

    if (found) {
        if (guessedCars === wordLength)
            w2g.innerText = "You won! The mystery word was \"" + theWord + "\"";
        else
            w2g.innerText = w2gempty.join(" ");
        letters[car.charCodeAt(0) - "A".charCodeAt(0)].classList.add("ok");
    } else {
        letters[car.charCodeAt(0) - "A".charCodeAt(0)].classList.add("ko");
        errNum++;
        let errstep = document.getElementById("i"+errNum);
        errstep.classList.add("err");
        if (errNum === MAXERR) {
            playing = false;
            w2g.innerText = "You lost! The mystery word was \"" + theWord + "\"";
        }
    }
}
