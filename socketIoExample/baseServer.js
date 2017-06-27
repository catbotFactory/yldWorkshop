var five = require('johnny-five')
var server = require('http').createServer()
var io = require('socket.io')(server)

var board = new five.Board()

board.on('ready', function () {
  // define your bot parts

  io.on('connection', function (socket) {
    // set the action when an even is fired
  })
})

server.listen(9582)
