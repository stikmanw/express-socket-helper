const bunyan = require('bunyan');
const EventEmitter = require('events');
const SocketPool = require('./socket-pool');

class SocketServer extends EventEmitter {
  constructor(server, config) {
    super();

    if (!server) {
      throw new TypeError('server');
    }

    this.config = config || {};
    this.server = server;
    this.clients = [];
    this.started = false;

    // if we have an existing socket we have go add it to our socket pool
    if (this.config.socket) {
      SocketPool.add(this.config.socket);
    }
  }

  start() {
    if (this.started) {
      return this;
    }

    // get our socket connection from the socket pool based on our server information
    this.io = SocketPool.instance(this.server);
    this.log = this.log || this.setupLogger(this.config);
    this.io.on('error', function socketFail(err) {
      this.log.error('socket server connection failed');
      this.emit('error', err);
      SocketPool.remove(this.server);
      return this;
    });

    /* if we want to delcare a specific namespace isloate to specific
     namespace for client connections */
    if (this.config.namespace) {
      this.io = this.io.of(this.config.namespace);
    }

    this.io.on('connection', this.onClientConnect.bind(this));
    this.started = true;
    this.log.info('socket event handlers were successfull started');
    this.emit('start', this);
    return this;
  }

  logger(logHandler) {
    this.log = logHandler;
  }

  /**
   * allow users to add their own log interface if they want otherwise use bunyan
   * @param {object}
   */
  setupLogger(config) {
    if (config.log) {
      return config.log;
    } else if (config.name && !config.log) {
      return bunyan.createLogger({ name: config.name });
    }

    return bunyan.createLogger({ name: 'generic socket server' });
  }

  /**
   * stub to override in class chain
   * @param {object} socket object from socket.io
   */
  bindEvents(socket) {
    return socket;
  }

  /**
   * Default healthcheck for the socket server overall connection
   */
  bindAllEvents(socket) {
    socket.on('socket/alive', function heartbeat() {
      socket.emit('socket/heartbeat', true);
    });

    socket.once('disconnect', (reason) => {
      this.onClientClose(socket, reason);
    });

    socket.once('error', (err) => {
      this.onClientError(socket, err);
    });

    this.bindEvents(socket);
    return;
  }

  /**
   * register bound events at initial connect
   */
  onClientConnect(socket) {
    this.bindAllEvents(socket);

    this.clients.push(socket);
    this.log.info('connected client %s, total clients: %s', socket.id, this.clients.length);
    this.emit('connect', socket);
  }

  onClientError(client, err) {
    this.log.info('there is an issue with client %s error: %s', client.id, err);
    this.onClientClose(client);
  }

  onClientClose(client, reason) {
    const index = this.clients.indexOf(client);
    this.clients.splice(index, 1);
    this.log.info('closed client %s due to %s', client.id, reason);

    this.emit('disconnect', client, reason);
  }

  close(callback) {
    const finished = callback || function noop() {};

    if (this.clients.length) {
      this.clients.forEach((socket, index, array) => {
        socket.disconnect();
        if (index === array.length - 1) {
          this.io.close(finished());
        }
      });
      return;
    }

    this.emit('close', this);
    finished();
    return;
  }

}

module.exports = SocketServer;
