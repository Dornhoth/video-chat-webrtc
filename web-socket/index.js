const http = require('http');
const server = require('websocket').server;

const httpServer = http.createServer(() => { });
httpServer.listen(1337, () => {
  console.log('Server listening at port 1337');
});

const wsServer = new server({
  httpServer,
});

const peersByCode = {};

wsServer.on('request', request => {
  const connection = request.accept();
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  connection.on('message', message => {
    const { code } = JSON.parse(message.utf8Data);
    if (!peersByCode[code]) {
      peersByCode[code] = [{ connection, id }];
    } else if (!peersByCode[code].find(peer => peer.id === id)) {
      peersByCode[code].push({ connection, id });
    }

    peersByCode[code]
      .filter(peer => peer.id !== id)
      .forEach(peer => peer.connection.send(message.utf8Data));
  });
});