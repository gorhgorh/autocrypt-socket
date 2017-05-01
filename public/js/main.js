/* global io, $ */
console.log('client v0.0.5')
var isConnected = false
var socket = io('http://localhost:8090')
// dom refs
// var form = document.getElementById('sendForm')

var userNameFld = document.getElementById('userName')
var userNameBt = document.getElementById('sendUserName')

var toFld = document.getElementById('to')
var msgFld = document.getElementById('message')
var subjectFld = document.getElementById('subject')
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
  socket.emit('user', {id: socket.id, userName: uName})
  socket.emit('mailUser', uName)

  // TODO on change bt click re-enable the input and bt for usernam
  userNameBt.disabled = true
  sendBt.disabled = false
  changeBt.disabled = false
  userNameBt.disabled = true

  socket.on('clients', function (data) {
    console.log('clientList', data)
    console.log('currentClient', socket.id)
  })

  socket.on('userArchive', function (mails) {
    console.log('userArchive', mails)
    displayMessages(mails)
  })
}

// send message
sendBt.onclick = sendMessage
// changeBt.onclick = document.location.reload(true)

function sendMessage (e) {
  e.preventDefault()
  // need a "loged in" user
  if (isConnected === false) {
    return console.log('guru meditation: sender undefined')
  }
  var msg = {}
  msg.to = toFld.value
  msg.from = userNameFld.value
  msg.msg = msgFld.value
  msg.subject = subjectFld.value
  msg.time = Date.now()
  console.log(msg)
  toFld.value = ''
  msgFld.value = ''
  subjectFld.value = ''
  if (msg.to === '' || msg.subject === '' || msg.msg === '') {
    return console.log('invalid msg')
  } else {
    socket.emit('sendEmail', msg)
  }
}

function displayMessages (msgs) {
  console.log(msgs.length)
  $('#mailbox').empty()
  msgs.forEach(function (msg) {
    $('<div/>', {
      'class': 'test',
      text: 'from:' + msg.from + ' to:' + msg.to + ' subject:' + msg.subject,
      click: function () {
        $(this).toggleClass('selected')
        $('#msgContent').html(msg.msg)
      }
    })
      .appendTo('#mailbox')
  }, this)
}
