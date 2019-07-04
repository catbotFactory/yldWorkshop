var nStatic = require('node-static')
var file = new nStatic.Server('./public')
var five = require('johnny-five')

var server = require('http').createServer(function (request, response) {
  file.serve(request, response)
}).listen(9582)

var io = require('socket.io')(server)

var board = new five.Board()

board.on('ready', function () {
  var pan = new five.Servo(10)
  var tilt = new five.Servo(11)
  var laser = new five.Led(12)

  board.repl.inject({
    pan: pan,
    tilt: tilt,
    laser: laser
  })

  var laserTimeout

  function fireLaser () {
    laser.on()
    clearTimeout(laserTimeout)
    laserTimeout = setTimeout(function () {
      laser.off()
    }, 500)
  }

  io.on('connection', function (socket) {
    console.log('i see a cat over there')
    socket.on('x', function (x) {
      console.log(x)
      fireLaser()
      pan.to(x)
    })

    socket.on('y', function (y) {
      console.log(y)
      fireLaser()
      tilt.to(y)
    })
  })
})
