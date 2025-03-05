const url = require("url");
const fs = require("fs");

const jsonwebtoken = require("jsonwebtoken");

let word="";
let motsLivre = [];
console.log("Lecture du livre");
let errors = 0;
let guessedCars=[];
let users = {};
let username = "";
let allGames = {};


let key = "cle";
let token = "";





class Game{
    constructor(motADecouvrir){
        this.word=motADecouvrir;
        this.errors=0;
        this.guessedCars=[];
    }
}

const livre = "lesmiserables.txt";

fs.readFile(livre, "utf8", (error, data)=>{
    if(error){
        console.error("Erreur lors de la lecture du fichier:", error);
        return;
    }

    let listeMots = data.split(/[(\r?\n),. ]/);
    for(let i=0; i<listeMots.length; i++){
        let ok=true;
        if((listeMots[i].length>=6)&&(listeMots[i].length<=8)){
            if(!motsLivre.includes(listeMots[i])){
                for (let k =0; k<listeMots[i].length; k++){
                    if((listeMots[i].charCodeAt(k)<97)||(listeMots[i].charCodeAt(k)>122)){
                        ok=false;
                    }
                }
                if(ok==true){
                    motsLivre.push(listeMots[i]);
                }
            }
        }
    }
    console.log(motsLivre);

})

function manageRequest(request, response) {
   
    let url1 = request.url.split("?")[0];
    let url2 = url1.split('/');
    let element = url2[2];
    //console.log(element);
    
    
   if (element == "signin") {
    let body = [];
    request.on('data', function (delta) {
        body.push(delta);
    });
    request.on('end', function () {
        let result = JSON.parse(body.join(''))
        body = result;
        if (!(body.username in users)) {
            users[body.username] = body.password;
            token = jsonwebtoken.sign({ username: body.username }, key, { expiresIn: "1d" });
            response.end(token);
        }
        else{
            response.end("utilisateur déjà inscrit")

        }
    });

    }

    if (element == "login") {
        let body = [];
        request.on('data', function (delta) {
            body.push(delta);
        });
        request.on('end', function () {
            let result = JSON.parse(body.join(''))
         body = result;

            if (body.username in users) {
                username = body.username;
                if(users[username]==body.password){
                    token = jsonwebtoken.sign({ username: body.username }, key, { expiresIn: "1d" });
                    response.statusCode=200;
                    response.end(token);
            
                }
                else{
                    response.statusCode=401;
                    response.end("Mot de passe faux"); 
                }
                
               
            }
            else{
                response.statusCode = 401;
                response.end("User non-existant");
            }
        });

    }

    if(element=="getWord"){
        word=getWord();
        response.statusCode = 200;
        response.end(`Word  : ${word}`);
    }

    if(element=="newGame"){
        token= request.headers.token;
        try{
            username= jsonwebtoken.verify(token, key).username;
            //console.log("username"+ username);
            word=getWord();
            let maPartie=new Game(word);
            wordLength=word.length;
            allGames[username]=maPartie;
            response.statusCode = 200;
            response.end(""+wordLength); 
        }
        catch(error){
            console.log("error", error);
        }
      
    }

    if(element == "testLetter"){

        token= request.headers.token;
       // console.log(word);
        let letter = request.url.split('?')[1].charAt(7).toLowerCase();
        console.log(letter);
        let partie = allGames[username];
        let positions = [];
        let isCorrect=false;
        let isGameOver= false;

        for (let i=0; i<partie.word.length; i++){
            if (partie.word.charAt(i)==letter){
                positions.push(i);
                isCorrect=true;
                partie.guessedCars.push(letter);
            }
    
        }

        if((partie.errors==7)||(partie.guessedCars.length==partie.word.length)){
                isGameOver=true;
            }

        if(isCorrect==false){
            partie.errors+=1;
            if(partie.errors==7){
                isGameOver=true;
            }
            if(isGameOver){
                errors=partie.errors;
                word=partie.word;
                delete allGames[username];
                response.end(JSON.stringify({
                    letter:letter,
                    errors:partie.errors,
                    word:word,
                    isCorrect: isCorrect,
                    isGameOver:isGameOver,
                    guessedCars:guessedCars,
                }));
            }
            else{
                response.end(JSON.stringify({
                    letter:letter,
                    errors:partie.errors,
                    isGameOver: isGameOver,
                    isCorrect: isCorrect,
                    guessedCars:guessedCars,
                }));

            }
        }

        else{
            if(guessedCars.length==word.length){
                isGameOver=true;
            }
            if(isGameOver){
                errors=partie.errors;
                word=partie.word;
                delete allGames[username];
                response.end(JSON.stringify({
                    letter:letter,
                    positions: positions,
                    isGameOver: isGameOver,
                    isCorrect: isCorrect,
                    word:word,
                    errors:errors,
                    guessedCars:guessedCars,
                }));
            }

            else{
                response.end(JSON.stringify({
                    letter:letter,
                    positions:positions,
                    isGameOver: isGameOver,
                    isCorrect: isCorrect,
                    errors:partie.errors,
                    guessedCars:guessedCars,
                }));
            }
        }
           
 
    }
      
    
}



function getWord() {
    let aleatoire= Math.round(Math.random()*motsLivre.length);
    word= motsLivre[aleatoire];
    return word;
}

exports.manage = manageRequest; 