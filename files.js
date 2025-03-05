const url = require("url");
const path = require("path");
const fs = require("fs");

const front = "./front";
const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.md': 'text/plain',
    '.gif':'image/gif',
    'default': 'application/octet-stream',}

function manageRequest(request, response) {
    
    
    try{
        response.statusCode = 200;
        let requestParse = url.parse(front + request.url);
        let pathName = requestParse.pathname;
        fs.statSync(pathName);
        fs.readFile(pathName, async function(error, data){
            if(error){
                response.end(error);

            }
            response.setHeader("Content-type", mimeTypes[path.parse(pathName).ext]);
            response.end(data);

        })
    }
    catch(error){
        response.statusCode = 404;
        response.end("not found");

    }

}

exports.manage = manageRequest; 