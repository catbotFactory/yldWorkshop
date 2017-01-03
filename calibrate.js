const five = require('johnny-five')
const board = new five.Board()

function testLaser (lzr) {
  console.log('Test blink start!')
  lzr.blink(500)
  setTimeout(function () {
    console.log('Blink off')
    lzr.stop()
    lzr.off()
  }, 10000)
}

board.on('ready', function () {
  // Create a standard `led` component instance
  var led = new five.Led(13)
  var servoX = new five.Servo(10)
  var servoY = new five.Servo(11)

  console.log('centering servo, you can now point the lazer in front of you to calibrate it to 90° 90°')
  console.log('servo and laser injected in the repl')
  console.log('servoX, servoY, laser')
  console.log('ex : servoX.to(30)')

  servoX.to(90)
  servoY.to(90)

  testLaser(led)

  this.repl.inject({
    // Allow limited on/off control access to the
    // Led instance from the REPL.
    on: function () {
      led.on()
    },
    off: function () {
      led.off()
    },
    laser: led,
    servoX,
    servoY
  })
})
