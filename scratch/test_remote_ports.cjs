const net = require('net');

const ports = [22, 80, 443, 3000, 4000, 5432, 5433, 5434, 5435];
const host = '200.97.162.71';

for (const port of ports) {
  const socket = new net.Socket();
  socket.setTimeout(2000);
  socket.on('connect', () => {
    console.log(`Port ${port} is OPEN on ${host}`);
    socket.destroy();
  });
  socket.on('timeout', () => {
    socket.destroy();
  });
  socket.on('error', (err) => {
    // closed
  });
  socket.connect(port, host);
}
