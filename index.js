const http = require('http');
let front = require("./files.js");
let api = require("./api.js");

const server = http.createServer(function(request, response) {
    
    const url = request.url.split('/');
    if(url[1]=="api"){
        api.manage(request, response);
    }
    else{
        front.manage(request, response);
    }
   

});
server.listen(8000);