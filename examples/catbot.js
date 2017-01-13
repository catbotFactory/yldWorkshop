const catbot = require('catbot')

catbot(function (err, hardware) {
  if (err) throw err
  if (!hardware) {
    throw new Error('`catbot` was not detected! *meow@1!*')
  }
  hardware.to([90, 90])
})
