const express = require('express')
const app = express();
const http = require('http').Server(app);
const fileReader = require('./fileReader');
const WebSocket = require('ws');
const fs = require('fs');
let wsConnections = [];

app.use(express.static('public'))
app.get('/logs', function (req, res) {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('public/index.html').pipe(res)
});

let readStream = fs.createReadStream('./logFile.txt', {
    encoding: "utf8"
});

readStream.on('data', (chunk) => { 
    console.log('data captured:', chunk, chunk.length);

    for(let idx = 0; idx < wsConnections.length; idx++) {
        const ws = wsConnections[idx];

        ws.send({
            chunk
        });
    }
});

readStream.on('end', () => {
    console.log('end captured');

    setTimeout(() => {
        readStream = fs.createReadStream('./logFile.txt');
    }, 200);
})

readStream.on('error', (err) => {
    console.log('error captured:', err);
})
 
const wss = new WebSocket.Server({ port: 8080 })
 
wss.on('connection', (ws) => {
    wsConnections.push(ws);
    ws.on('message', message => {
        console.log(`Received message => ${message}`)
    })

    ws.send({
        chunk: fileReader('./logFile.txt')
    })
});

http.listen(3000, function(){
    console.log('Node server started on port 3000');
});