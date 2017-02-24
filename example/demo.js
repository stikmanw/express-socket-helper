const SocketServer = require('../lib/socket-server');

class Demo extends SocketServer {
  constructor(...args) {
    super(...args);
    this.config.name = 'Demo Controller';
    this.config.namespace = 'group/demo';
  }

  bindEvents(socket) {
    // Expected Event Model will be that of Performance/PageEvent
    socket.on('ping', () => {
      socket.emit('pong'); 
    });
  }
}

module.exports = Demo;
