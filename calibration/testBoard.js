var SerialPort = require('serialport')
var Board = require('firmata')
var chalk = require('chalk')
var red = chalk.red
var green = chalk.green
var blue = chalk.blue
var ylo = chalk.yellow

var rport = /usb|acm|^com/i // taken from J5 code, thanks!

function listBoards (err, ports) {
  console.log(blue('listing arduino boards'))
  if (err) console.log(err)
  var boards = ports.filter(function (port) {
    // console.log(port, rport.test(port.comName))
    return rport.test(port.comName)
  })
  if (!boards.length) {
    console.log(red('no Board found'))
    return false
  }
  testSerialCom(boards[0].comName)
}

function testSerialCom (portName) {
  console.log(blue('found board:', portName))
  var board = new Board(portName)

  board.on('open', function () {
    let attempts = 0
    console.log(blue('\nserial port is open, testing firmata ...'))
    setInterval(function () {
      console.log(ylo('waiting for firmata ready event ...'))
      if (attempts === 4) {
        console.log(red('can\'t communicate with firmata, please flash/re-flash the board'))
        process.exit()
      }
      ++attempts
    }, 2000)
  })
  board.on('ready', function () {
    console.log(green('\nyour board is ready to use !'))
    process.exit()
  })
}

SerialPort.list(listBoards)
