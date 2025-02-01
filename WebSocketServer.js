const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

function broadcastConnectedClients() {
  const message = JSON.stringify({
    type: 'device_count',
    count: wss.clients.size
  });
  
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', function connection(ws) {
  // Broadcast the number of connected clients when a new client connects
  broadcastConnectedClients();

  ws.on('message', function incoming(message) {
    let messageStr;
    if (Buffer.isBuffer(message)) {
      messageStr = message.toString('utf8');
    } else {
      messageStr = message;
    }

    // Log the received message
    console.log('received: %s', messageStr);

    // Parse the message to ensure it's a JSON object
    let messageJSON;
    try {
      messageJSON = JSON.parse(messageStr);
    } catch (e) {
      console.error('Invalid JSON format:', messageStr);
      return;
    }
    console.log(messageJSON);
    // Broadcast the received message to all clients except the sender
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageJSON));
      }
    });
  });

  ws.on('close', function() {
    // Broadcast the number of connected clients when a client disconnects
    broadcastConnectedClients();
  });

  // Send a welcome message to the newly connected client
  ws.send(JSON.stringify({ message: 'Welcome to WebSocket server!' }));
});

console.log('WebSocket server is running on ws://localhost:8000');
