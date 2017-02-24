const app = require('express')();
const bodyParser = require('body-parser');
const DemoController = require('./demo');
const SocketPool = require('../socket-pool');

// X-Origin Acceptance headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, ' +
    'Accept, api-version, Authorization, Content-Length, Access-Control-Allow-Origin, ' +
    'Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
});

app.use(bodyParser.json());

const port = process.env.PORT || 3045;
const server = require('http').Server(app);
server.listen(port);

// create a socket connection to the server 
const socket = require('socket.io')(server);

// register the socket in our pool
SocketPool.add(socket);

// register the handler on the server
new DemoController(server).start();

