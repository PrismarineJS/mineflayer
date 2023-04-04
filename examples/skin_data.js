/*
 * This script will automatically set if a totem is in the inventory or the off-hand.
 * It checks for a totem every tick.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node skin_data.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'skin_data',
  password: process.argv[5]
})

setTimeout(() => {
  bot.quit()
  console.log('Skin data:')
  console.log(Object.entries(bot.players).map(([name, player]) => ({
    name,
    skinData: player.skinData
  })))
}, 10000)
