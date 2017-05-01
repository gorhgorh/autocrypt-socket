var fs = require('fs-extra')
var pth = require('path')
var nstatic = require('node-static')
var debug = require('debug')('autocrypt:server')
var app = require('http').createServer(handler)
var io = require('socket.io')(app)

// / serve public folder on port 8090
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

// / web socket
io.on('connection', function (socket) {
  var usrMessage = []
  var currUser

  debug('someone connect', socket.id)

  socket.on('user', function (user) {
    debug('user event', user)

    var client = {id: socket.id, userName: user.userName}
    addClient(client, clientsList)
    currUser = client.userName
  })

  socket.on('mailUser', function (user) {
    debug('mailUser event', user)
    socket.join(user)
    fs.readJson(pth.join(__dirname, 'msgs', user + '.json'), (err, msgs) => {
      if (err) {
        // if file does not exists
        if (err.errno === -2) {
          // create a default
          writeMsgs(user, msgsArr)
          usrMessage = msgsArr
          io.sockets.in(user).emit('message', msgsArr)
        // log other error types
        } else return debug(err)
      } else {
        usrMessage = msgs
        io.sockets.in(user).emit('userArchive', usrMessage)
      }
    })
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

var msgsArr = [{
  from: 'mailserver',
  to: '',
  msg: 'this is a test message, yarrrr',
  time: 1493630161845
}]

function writeMsgs (user, msgs) {
  fs.writeJson(pth.join(__dirname, 'msgs', user + '.json'), msgs, err => {
    if (err) return console.error(err)
    debug('msgs written')
  })
}
