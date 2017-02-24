const SocketServer = require('../lib/socket-server');

class Demo extends SocketServer {
  constructor(...args) {
    super(...args);
    this.config.name = 'Demo Controller';
    this.config.namespace = 'group/demo';
  }

  bindEvents(socket) {
    socket.on('ping', () => {
      socket.emit('pong'); 
    });
  }
}

module.exports = Demo;
