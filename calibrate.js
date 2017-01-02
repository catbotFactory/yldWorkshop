const five = require('johnny-five')
const board = new five.Board()

board.on('open', function () {
  let attempts = 0
  console.log('serial port is open, testing firmata ...')
  setInterval(function () {
    console.log('waiting for firmata ready event ...')
    if (attempts === 4) {
      console.log('can\'t communicate with firmata, please reflash the board')
      process.exit()
    }
    ++attempts
  }, 2000)
})
// board.on('ready', function () {
//   // Create a standard `led` component instance
//   var led = new five.Led(13)
//   console.log('your board is ready to use, exiting')
//   process.exit()
//   // "blink" the led in 500ms
//   // on-off phase periods
//   led.blink(500)
// })
