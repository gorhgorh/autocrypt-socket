/* global io */
console.log('client v0.0.4')
var isConnected = false
var userMsgs
var socket = io('http://localhost:8090')
// dom refs
// var form = document.getElementById('sendForm')

var userNameFld = document.getElementById('userName')
var userNameBt = document.getElementById('sendUserName')

var toFld = document.getElementById('to')
var msgFld = document.getElementById('message')
var sendBt = document.getElementById('sendMessage')

var changeBt = document.getElementById('changeUser')

// socket part

// form
// get client name
userNameBt.onclick = clientConnect

function clientConnect () {
  var uName = userNameFld.value
  if (uName === '') return console.log('uname should not be empty')


  isConnected = true
  console.log('connected as', socket.id)
  socket.emit('mailUser', uName)

  socket.emit('user', {id: socket.id, userName: uName})
  // userNameBt.disabled = true

  socket.on('clients', function (data) {
    console.log('clientList', data)
    console.log('currentClient', socket.id)
  })

  socket.on('userMessages', function (data) {
    userMsgs = data
    displayMessages(data)
  })
}

// send message
sendBt.onclick = sendMessage
// changeBt.onclick = document.location.reload(true)

function sendMessage (e) {
  e.preventDefault()
  var msg = {}
  msg.to = toFld.value
  msg.msg = msgFld.value
  console.log(msg)
  toFld.value = ''
  msgFld.value = ''
}

function displayMessages (msgs) {
  console.log(msgs)
}
