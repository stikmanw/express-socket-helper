const Socket = require('socket.io/lib/socket');
let socketServerPool = {};

/**
 * Get the socket instance using the express server object
 * create a new instance where there is not
 */
function instance(server, create = true) {
  const port = server.address().port;
  if (!socketServerPool[port] && create) {
    socketServerPool[port] = require('socket.io')(server);
  }

  return socketServerPool[port];
}

function add(socket) {
  if (!socket instanceof Socket) {
    throw new TypeError('socket must be an instance of socket.io Server');
  }

  socketServerPool[socket.httpServer.address().port] = socket;
}

function pool() {
  return socketServerPool;
}

function remove(server) {
  const port = server.address().port;
  if (socketServerPool[port]) {
    socketServerPool[port] = null;
  }
}

function reset() {
  socketServerPool = {};
}

/**
 * Get an socket server instance in th pool
 */
module.exports = {
  instance,
  add,
  remove,
  pool,
  reset
};
