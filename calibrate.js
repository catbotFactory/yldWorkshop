const os = require('os')
const inc = require('inquirer')
const async = require('async')
const debug = require('debug')('catbot:calibrate')

const chalk = require('chalk')
const green = chalk.green
const red = chalk.red
const blue = chalk.cyan



const five = require('johnny-five')

const laserPrompt = {
  type: 'confirm',
  name: 'didLaserBlinked',
  message: 'did the laser blinked?'
}

function testLaser (lzr, cb) {
  console.log(blue('Testing laser'))
  console.log(blue('Test blink start!'))
  lzr.blink(200)
  setTimeout(function () {
    console.log(blue('Blink off'))
    lzr.stop()
    lzr.off()
    inc.prompt([laserPrompt]).then(function (answers) {
      debug(answers)
      if (answers.didLaserBlinked === true) {
        if (cb) cb(null, 'servoCenter')
      } else {
        testLaser(lzr, cb)
      }
    })
  }, 1000)
}

const servoPrompt = {
  type: 'confirm',
  name: 'didServoSweep',
  message: 'did the servo swept ?'
}


function testServos (servoX, servoY, cb) {
  console.log(blue('Centering servo, you can now point the lazer in front of you to calibrate it to 90° 90°'))
  servoX.to(90)
  servoY.to(90)

  setTimeout(function () {
    console.log(blue('end centering sweeping servo X'))
    servoX.sweep()
    setTimeout(function () {
      servoX.stop()
      servoX.to(90)
      inc.prompt([servoPrompt]).then(function (answers) {
        debug(answers)
      })
    }, 2000)
  }, 1000)
}

// create the catboard instance
function catBoard () {
  var led = new five.Led(13)
  var servoX = new five.Servo(10)
  var servoY = new five.Servo(11)

  async.series([
    function (cb) {
      // do some stuff ...
      testLaser(led, cb)
    },
    function (cb) {
      // do some more stuff ...
      testServos(servoX, servoY, cb)
    }
  ],
    // optional callback
    function (err, results) {
      if (err) console.log(err)
      debug(results)
    })


}

const initQuestions = [{
  type: 'confirm',
  name: 'isPsuPlugged',
  message: 'is your arduino connected to the 9v PSU and the usb connected to your computer ?'
}]

const questions = [
  {
    type: 'list',
    name: 'size',
    message: 'What size do you need?',
    choices: ['Large', 'Medium', 'Small'],
    filter: function (val) {
      return val.toLowerCase()
    }
  }
]

function initQ () {
  return inc.prompt(initQuestions).then(function (answers) {
    console.log(blue(JSON.stringify(answers)))
    if (answers.isPsuPlugged === true) {
      createBoard(catBoard)
    } else {
      console.log(red('please connect them and retry'))
      initQ()
    }
  }).catch(function (e) {
    console.log(e) // "zut !"
  })
}

function createBoard (boardCb, opts) {
  if (!opts) opts = {repl: false}
  const board = new five.Board(opts)
  board.on('ready', boardCb)
  return board
}

function calibrate () {
  console.log(blue('Starting Catbot calibration process'))
  initQ()
}

calibrate()
