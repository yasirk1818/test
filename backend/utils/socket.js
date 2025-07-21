const { io } = require('socket.io-client');
const socketIO = require('socket.io');

let ioServer;

exports.init = (server) => {
  ioServer = socketIO(server);

  ioServer.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.id;
      next();
    });
  });

  ioServer.on('connection', (socket) => {
    console.log('Socket connected:', socket.userId);
  });
};

exports.sendQR = (userId, qr) => {
  ioServer.to(userId).emit('qr', qr);
};

exports.sendReady = (userId) => {
  ioServer.to(userId).emit('whatsapp-ready');
};
