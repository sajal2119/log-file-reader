const ws = new WebSocket('ws://localhost:8080', ['json', 'xml']);

ws.addEventListener('message', event => {
    const data = JSON.parse(event.data);

    let node = document.createElement("LI");        
    node.innerHTML = data.chunk;                   
    document.getElementById("logs-list").appendChild(node);  
});
