/*
 * Since 1.8 the players skin can have a second layer over their whole skin.
 *
 * This example will toggle that layer every half second, making your skin 'blick'
 * (If your bots skin has a second layer)
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node jumper.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'skin_blinker',
  password: process.argv[5]
})

let show = true

function toggleSkin () {
  show = !show
  bot.setSettings({
    skinParts: {
      showJacket: show,
      showHat: show,
      showRightPants: show,
      showLeftPants: show,
      showLeftSleeve: show,
      showRightSleeve: show
    }
  })
}

bot.on('spawn', () => {
  setInterval(toggleSkin, 500)
})
