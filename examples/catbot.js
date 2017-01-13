const catbot = require('catbot')

catbot(function (err, hardware) {
  if (err) throw err
  if (!hardware) {
    throw new Error('`catbot` was not detected! *meow@1!*')
  }
  // let's party
  hardware.to([90, 130]) // center x, ant point y to the top
  hardware.laser.blink() // blinks laser blink
  hardware.x.sweep() // let's dance!
})
