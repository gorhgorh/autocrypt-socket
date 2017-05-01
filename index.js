var nstatic = require('node-static')
var debug = require('debug')('autocrypt:server')
var app = require('http').createServer(handler)
var io = require('socket.io')(app)

var file = new nstatic.Server('./public')
var clientsList = {}
app.listen(8090)

// serve static files in the public dir
function handler (req, res) {
  req.addListener('end', function () {
    console.log('page called')
    file.serve(req, res)
  }).resume()
}

io.on('connection', function (socket) {
  debug('someone connect', socket.id)
  var currUser
  socket.on('user', function (user) {
    debug('user event', user)

    var client = {id: socket.id, userName: user.userName}
    addClient(client, clientsList)
    currUser = client.userName
  })


  // on new client broadcast the client list
  socket.emit('clientsList', clientsList)

  socket.on('disconnect', function () {
    debug('client', socket.id, currUser, 'parted')
    if (currUser !== undefined) {
      clientsList[currUser].id = ''
      debug('clear id', clientsList)
    }
  })
})

function addClient (client, clients) {
  clients[client.userName] = {id: client.id}
  debug(clients)
}
