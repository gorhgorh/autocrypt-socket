var fs = require('fs-extra')
var pth = require('path')
var nstatic = require('node-static')
var debug = require('debug')('autocrypt:server')
var app = require('http').createServer(handler)
var io = require('socket.io')(app)
var ip = require('ip')

// / serve public folder on port 8090
var file = new nstatic.Server('./public')
var clients = {} // all CONNECTED clients socket
var port = 8090
app.listen(port)
console.log('autocrypt demo v0.0.0server is runnig http://' + ip.address() + ':' + port)

// serve static files in the public dir
function handler (req, res) {
  req.addListener('end', function () {
    file.serve(req, res)
  }).resume()
}

// / web socket
io.on('connection', function (socket) {
  var currUser
  var usrMessages = []
  debug('user connects', socket.id)

  // client send a username
  socket.on('user', function (user) {
    debug('user ', socket.id, ' name:', user.userName)
    socket.join(user.userName) // connect to the users 'room'
    clients[user.userName] = {}
    clients[user.userName].socket = socket // make a ref of each client socket
    currUser = user.userName
  })

  // client request mailArchive
  socket.on('mailUser', function (user) {
    debug(user, 'request server\'s mails')
    fs.readJson(pth.join(__dirname, 'msgs', user + '.json'), (err, msgs) => {
      if (err) {
        // if file does not exists
        if (err.errno === -2) {
          // create a default message
          var msgsArr = [{
            from: 'mailserver',
            to: user,
            subject: 'init mail',
            msg: 'welcome',
            time: 1493630161845
          }]
          usrMessages = msgsArr
          writeMsgs(user, msgsArr)
          io.sockets.in(user).emit('userArchive', msgsArr)
        // log other error types
        } else return debug(err)
      } else {
        usrMessages = msgs
        debug(msgs)
        io.sockets.in(user).emit('userArchive', usrMessages)
      }
    })
  })

  socket.on('sendEmail', function (message) {
    debug(currUser === message.from)
    if (currUser !== message.from) return debug('invalid recipient', currUser, message.from)
    usrMessages.push(message)
    writeMsgs(currUser, usrMessages)
    sendToRecipient(message.to, message)
    io.sockets.in(currUser).emit('userArchive', usrMessages)
    // debug(usrMessages)
  })

  // on new client broadcast the connected recipents list
  socket.emit('clientsList', clients.keys)

  socket.on('disconnect', function () {
    debug('client', socket.id, currUser, 'parted')
    debug(clients)
    if (currUser !== undefined) {
      delete clients[currUser].socket
    }
  })
})

function writeMsgs (user, msgs) {
  debug('write JSON msgs for ', user)
  if(!clients[user]) clients[user] = {}
  clients[user].msgs = msgs
  var fPath = pth.join(__dirname, 'msgs', user + '.json')
  fs.outputJson(fPath, msgs, err => {
    if (err) return console.error(err)
    debug('msgs written:', fPath)
  })
}

function sendToRecipient(rcpt, msg) {
  fs.readJson(pth.join(__dirname, 'msgs', rcpt + '.json'), (err, msgs) => {
    if (err) {
      // if file does not exists
      if (err.errno === -2) {
        // create a default message
        var msgsArr = [msg]
        writeMsgs(rcpt, msgsArr)
        // io.sockets.in(rcpt).emit('userArchive', msgsArr)
      // log other error types
      } else return debug(err)
    } else {
      debug(msgs)
      msgs.push(msg)
      writeMsgs(rcpt, msgs)
      io.sockets.in(rcpt).emit('userArchive', msgs)
    }
  })
}
