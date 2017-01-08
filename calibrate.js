const inc = require('inquirer')
const async = require('async')
const debug = require('debug')('catbot:calibrate')
const rc = require('rc')
const five = require('johnny-five')

const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const homeDir = os.homedir()

const chalk = require('chalk')
const green = chalk.green
const red = chalk.red
const blue = chalk.cyan

// default catbot config
const catDef = {
  isHWTested: false,
  inverted: {
    X: false,
    Y: false
  },
  hw: {
    laser: {
      pin: 12
    },
    servoX: {
      pin: 10
    },
    servoY: {
      pin: 11
    }
  }
}

// check for existing conf and merge them
const catConf = rc('catbot', catDef)

// check if conf exist (debug)
if (catConf.configs === undefined) debug(red('no conf file'))
else debug(catConf)

// laser test
const laserPrompt = {
  type: 'confirm',
  name: 'didLaserBlinked',
  message: 'did the laser blinked?'
}

/**
 * test laser by blinking it
 *
 * @param {Object} lzr j5 object
 * @param {function} cb async.js cb for the serie
 */
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
        if (cb) cb(null, {laser: true})
      } else {
        testLaser(lzr, cb)
      }
    })
  }, 3000)
}

// test servo
const servoPrompt = {
  type: 'confirm',
  name: 'didServoSweep',
  message: 'did the servo swept ?'
}

function testServo (servo, name, cb) {
  setTimeout(function () {
    console.log(blue('end centering sweeping', name))
    servo.sweep()

    setTimeout(function () {
      servo.stop()
      servo.to(90)
      inc.prompt([servoPrompt]).then(function (answers) {
        debug(answers)
        if (answers.didServoSweep === true) {
          const obj = {}
          obj[name] = true
          cb(null, obj)
        } else {
          console.log(blue('check that the servo'), name, blue('is connected to the pin', catConf.hw[name].pin), 'and that the board is connected to the PSU')
          inc.prompt({
            type: 'confirm',
            name: 'retry',
            message: 'retry?'
          }).then(function (a) {
            debug(a)
            if (a.retry === true) {
              testServo(servo, name, cb)
            } else {
              process.exit()
            }
          })
        }
      })
    }, 2000)
  }, 1000)
}

// test need for inverted axes
function testInvAxes (servoX, servoY) {
  async.series([
    function (cb) {
      testInvert(servoX, 'X', 'left', [30, 120], cb)
    },
    function (cb) {
      testInvert(servoY, 'Y', 'up', [30, 120], cb)
    }
  ],
    function (err, results) {
      if (err) console.log(err)
      debug(results)
      console.log(green('Ready To GO'))
      debug(catConf)
      debug(catConf.inverted)
      const conf = {
        isHWTested: catConf.isHWTested,
        inverted: catConf.inverted,
        hw: catConf.hw
      }
      fs.writeJsonSync(path.join(homeDir, '.catbotrc'), conf)
      process.exit()
    })
}

/**
 * check if inver axe is needed
 *
 * @param {object} servo js servo
 * @param {string} axe axe name X or Y (horizontal / vertical)
 * @param {string} side up / left
 * @param {array} angle angle to test fist angle of the array is normal second is inverted one (30 and 120°)
 * @param {function} cb async serie
 */
function testInvert (servo, axe, side, angle, cb) {
  console.log(blue(`Testing ${axe} alignement`))
  let ang = (catConf.inverted[axe] === false) ? angle[0] : angle[1]
  debug(catConf.inverted, catConf.inverted[axe], ang)
  servo.to(ang)
  inc.prompt({
    type: 'confirm',
    name: 'is45',
    message: `did the turret movet to the ${side}?`
  }).then(function (a) {
    debug(a)
    if (a.is45 === true) {
      debug(`axe ${axe} isInverted: ${catConf.inverted[axe]}`)
      if (cb) cb(null, {horizontal: true})
    } else {
      // invert axe and test
      catConf.inverted[axe] = true
      testInvert(servo, axe, side, angle, cb)
    }
  })
}

// create the catboard instance
function catBoard () {
  const hw = catConf.hw
  var led = new five.Led(hw.laser.pin)
  var servoX = new five.Servo(hw.servoX.pin)
  var servoY = new five.Servo(hw.servoY.pin)
  servoX.to(90)
  servoY.to(90)
  
  if (catConf.isHWTested !== true) {
    async.series([
      function (cb) {
        testLaser(led, cb)
      },
      function (cb) {
        testServo(servoX, 'servoX', cb)
      },
      function (cb) {
        testServo(servoY, 'servoY', cb)
      }
    ],
      function (err, results) {
        if (err) console.log(err)
        catConf.isHWTested = true
        debug(results, catConf.isHWTested)
        console.log(green('Hardware is tested and connected to the defaults pins'))
        const hws = Object.keys(catConf.hw)
        hws.forEach(function (item) {
          console.log(blue(item + ':'), catConf.hw[item].pin)
        })
        testInvAxes(servoX, servoY)
      })
  } else {
    testInvAxes(servoX, servoY)
  }
}

const initQuestions = [{
  type: 'confirm',
  name: 'isPsuPlugged',
  message: 'is your arduino connected to the 9v PSU and the usb connected to your computer ?'
}]

function initQ () {
  return inc.prompt(initQuestions).then(function (answers) {
    debug(answers)
    if (answers.isPsuPlugged === true) {
      createBoard(catBoard)
    } else {
      console.log(red('please connect them and retry'))
      initQ()
    }
  }).catch(function (e) {
    console.log(red(e)) // "zut !"
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
