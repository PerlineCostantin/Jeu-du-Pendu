
//Declaration des Variables 

let playing = false; //indique l'etat du jeu (en cours ou non)
let sections = ["newgame","gimage","gcontrols"];
let sect = ["log-in", "sign-in"];
let cars = 0; // nb lettres trouvées
let errNum = 0; 
const letters = document.querySelectorAll("#gchars > span");
const MAXERR = 7; //nb max d'erreurs
let LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let wordLength;
let token = ""; // Stocke le token de connexion



function initialView() { // initialise la page 
    
    sections.forEach((elem) => {
        let sec = document.getElementById(elem);
        sec.classList.remove("playing");
        sec.classList.add("notplaying");
    });
    document.getElementById("newgame").style.display = "none";
    document.getElementById("continue").style.display = "none";
    
    addGameEvents();
}


window.addEventListener("load", (event) => {
    initialView();
});



async function fetchWord() { // récupère un mot aléatoirement
    try {
        let resp = await fetch("http://localhost:8000/api/newGame", {
            headers: {
                'token': token // Ajoute le token dans le header
                }
        });
        if(resp.ok){
            
            wordLength= await resp.text();// avec le nouveau serveur, il faut transformer en text et non en json
            console.log("word length", wordLength);
            return wordLength;
        }
        else{
            console.log("error");
            return -1;
        }

    } catch (error) {
        console.error("Error fetching word:", error);
        return -1;
    }
}



async function initHtmlW2guess() { // initialise l'affichage du mot à trouver
    wordLength = await fetchWord();
    console.log(wordLength);

    let w2gempty = "";
    let w2g = document.getElementById("word2guess");
    for (let i = 0; i < wordLength; i++){
        w2gempty += "_";
    }
    w2gempty = w2gempty.split("");
    w2g.innerText = w2gempty.join(" ");

    sect.forEach((elem)=>
     {
        let sect = document.getElementById(elem);
        sect.classList.add("notplaying");
        sect.classList.remove("playing");
    })

    //Masquer les boutons pour lancer le jeu
    document.getElementById("newgame").style.display = "none";
    document.getElementById("continue").style.display = "none";
}



function newGame() { // Démarrer nouvelle partie
    console.log("new game");
  

    for(let i = 0; i < sections.length; i++) { 
        let sec = document.getElementById(sections[i]);
        sec.classList.remove("notplaying");
        sec.classList.add("playing");
    }
    
    sect.forEach((elem)=>
     {
        let sect = document.getElementById(elem);
        sect.classList.add("notplaying");
        sect.classList.remove("playing");
    })

    initHtmlW2guess(wordLength);

    playing = true;
    cars = 0;
    errNum = 0;

    for(let i = 0; i < letters.length; i++) { // Réinitialise affichage lettres
        letters[i].classList.remove("ok");
        letters[i].classList.remove("ko");
    }
    for(let i = 1; i <= MAXERR; i++ ) { // Réinitialise affichage pendu
        let errstep = document.getElementById("i"+i);
        errstep.classList.remove("err");
    }
}


function addGameEvents() {

    let ngb = document.getElementById(sections[0]);
    ngb.addEventListener("click", newGame);

    let rb = document.getElementById("restartb");
    rb.addEventListener("click", newGame);

    letters.forEach((letter) => {  // Ajoute écouteurs de clic pour chaque lettre
        letter.addEventListener("click",(event) => {
            tryCar(event.currentTarget.innerText);
        });
    });

    let loginButton = document.querySelector("#log-in input[type='button']");
    let signInButton = document.querySelector("#sign-in input[type='button']");

    loginButton.addEventListener("click", loginUser);
    signInButton.addEventListener("click", signInUser);

    let newGameButton = document.getElementById("continue");
    newGameButton.addEventListener("click", continueGame);

}



function validPassword(password) { // Vérifie toutes les contraintes sur le mot de passe
    //  longueur du mot de passe
    if (password.length < 8) {
        return "Le mot de passe doit contenir minimum 8 caractères.";
    }

    // contient au moins une lettre
    if (!/[a-zA-Z]/.test(password)) {
        return "Le mot de passe doit contenir au moins une lettre.";
    }

    // contient au moins un chiffre
    if (!/\d/.test(password)) {
        return "Le mot de passe doit contenir au moins un chiffre.";
    }
    // Si toutes contraintes satisfaites,
    return null;
}


async function signInUser() { //Pour s'inscrire

    let username = document.querySelector("#sign-in input[type='text']").value;
    let password = document.querySelector("#sign-in input[type='password']").value;

    // Valider le mot de passe
    let validationMessage = validPassword(password);
    if (validationMessage) {
        console.error(validationMessage);
        return;
    }

    let userData = {
        "username": username,
        "password": password,
    };

    try {
    
        let response = await fetch("http://localhost:8000/api/signin",{
            body: JSON.stringify(userData),
            method: "POST",
            headers: { 'Content-Type': "application/json" },

        });

        if (response.ok) {
            console.log("User signed in successfully!");
            let data = await response.text();
            token = data; // Stocke le token  

            // Masquer le bloc d'inscription une fois l'inscription réussie
            document.getElementById("sign-in").classList.add("notplaying");
            document.getElementById("sign-in").classList.remove("playing");

            // Masquer le bloc de connexion 
            document.getElementById("log-in").classList.add("notplaying");
            document.getElementById("log-in").classList.remove("playing");

            //Afficher les boutons pour lancer le jeu
            document.getElementById("newgame").style.display = "block";
            document.getElementById("continue").style.display = "block";
        } 
        else {
            console.error("Sign in failed");
        }
    } 
    catch (error) {
        console.error("Error:", error);
    }

}



async function loginUser() { // Pour se connecter
    let username = document.querySelector("#log-in input[type='text']").value;
    let password = document.querySelector("#log-in input[type='password']").value;

    let userData = {
        "username": username,
        "password": password,
    };

    try {
        let response = await fetch("http://localhost:8000/api/login",{
            body: JSON.stringify(userData),
            method: "POST",
            headers: { 'Content-Type': "application/json" },
        });
        if (response.ok) {
            console.log("User loged in successfully!");
            let data = await response.text();
            token = data; // Stocke le token obtenu
            let loginSection = document.getElementById("log-in");

            // Masquer le bloc de connexion une fois la connexion réussie
            document.getElementById("log-in").classList.add("notplaying");
            document.getElementById("log-in").classList.remove("playing");

            // Masquer le bloc d'inscription 
            document.getElementById("sign-in").classList.add("notplaying");
            document.getElementById("sign-in").classList.remove("playing");

            //Afficher les boutons pour lancer le jeu
            document.getElementById("newgame").style.display = "block";
            document.getElementById("continue").style.display = "block";

        } 
        else {
            console.error("Login failed");
        }
    } 
    catch (error) {
        console.error("Error:", error);
    }
  
}



async function res(car){
    try {
        let response = await fetch(`http://localhost:8000/api/testLetter?letter=${car}`, {
            headers: {
                'token': token //token dans header
            }
        });
        
        if(response.ok){
            let data=await response.json();
            console.log(data);
            let letter = data.letter;
            let isCorrect = data.isCorrect;
            let errors = data.errors;
            let positions = data.positions;
            let isGameOver = data.isGameOver;
            let mot= data.word;
            return [letter, isCorrect, errors, positions, isGameOver, mot];
           
        }
        else{
            console.log("error");
            return null;
        }
    } catch (error) {
        console.error("Error fetching letter:", error);
        return null;
    }
}


async function tryCar(car) { //tester une lettre
    if (!playing) return;

    let w2g = document.getElementById("word2guess");
    let w2gempty = w2g.innerText.split(" ");
    let [ letter, isCorrect, errors, positions, isGameOver, mot ] = await res(car);

    if(isCorrect){
        positions.forEach(pos=>w2gempty[pos]=car);
        cars=cars + positions.length;
        console.log(wordLength);
        console.log(cars.length);

        if (isGameOver) {
            
            if (cars == wordLength){
                w2g.innerText = "You won! The mystery word was \"" + mot + "\"";
            }
            else{
                w2g.innerText = "You lost! The mystery word was \"" + mot + "\"";
            }
        }
        else{
            w2g.innerText = w2gempty.join(" ");
            letters[car.charCodeAt(0) - "A".charCodeAt(0)].classList.add("ok");
            } 
    }
    else {
        letters[car.charCodeAt(0) - "A".charCodeAt(0)].classList.add("ko");
        let errstep = document.getElementById("i"+errors);
        errstep.classList.add("err");
        if (errors === MAXERR) {
            playing = false;
            w2g.innerText = "You lost! The mystery word was \"" + mot + "\"";
            }
        }
    LETTERS=LETTERS.replace(car,"");
    }

    

    
async function continueGame() { //pour reprendre une partie
   
    let gameState=await fetchGameState();
    console.log(gameState);
    if (gameState) {
        newGameButton.classList.remove("notplaying");
        newGameButton.classList.add("playing");
        resumeButton.classList.add("playing");
        resumeButton.classList.remove("notplaying");
        cars.style.display = "block";
        logOutButton.classList.remove("playing");
        logOutButton.classList.add("notplaying");
        restartButton.classList.remove("playing");
        restartButton.classList.add("notplaying");
        wordLength = gameState[0];
        let nbErrors = gameState[1];
        let correctLetters = gameState[2];
        let incorrectLetters = gameState[3];
        for (let i = 1; i <= nbErrors; i++) {
            const svgElement = document.getElementById("i" + i);
            svgElement.style.display = "block";
        }
        
        let result = "";
        let displayedResult = document.getElementById("word2guess");
        for (let i = 0; i < wordLength; i++) {
            result += correctLetters[i];
        }
        result = result.split("");
        displayedResult.innerText = result.join(" "); // Affiche le mot à deviner sous forme de tirets

        sections.forEach((elem) => {
            let section = document.getElementById(elem);
            section.classList.remove("notplaying");
            section.classList.add("playing"); //on est en train de jouer
 
        });
        sect.forEach((elem) => {
            let sect = document.getElementById(elem);
            sect.classList.remove("playing");
            sect.classList.add("notplaying"); // Masque les sections de jeu, affiche la section de départ
 
        });
 
        playing = true; // Indique que le jeu a démarré
 
 
        for (let i = 0; i < LETTERS.length; i++) {
            if (incorrectLetters.includes(letters[i])) {
                letters[i].classList.add("ko"); // plus de lettres en marron
            } else if (correctLetters.includes(letters[i])) {
                letters[i].classList.add("ok"); // plus de lettres en vert (cliquées)
            }
            LETTERS = LETTERS.replace(letters[i], "");
        }
    }
 
    else {
        console.error("Error retrieveing letter information.");
    }
 
}



async function fetchGameState() { //pour recuperer l'etat du jeu
    try {
        // appel GET a URL gameState
        let response = await fetch("http://quoridorarena.ps8.academy/gameState", {
            headers: {
                'token': token // token dans le header
            }
        });

        if (response.ok) {
            let data = await response.json();
            let wordLength=data.wordLength;
            let nbErrors=data.nbErrors;
            let correctLetters=data.correctLetters;
            let incorrectLetters=data.incorrectLetters;
            return [wordLength,nbErrors, correctLetters, incorrectLetters];
        } 
        else {
            console.error("Failed to fetch game state");
        }
    } 
    catch (error) {
        console.error("Error fetching game state:", error);
        return null
    }
}


function showLoading() {
    document.getElementById("loading").style.display = "block";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
}
