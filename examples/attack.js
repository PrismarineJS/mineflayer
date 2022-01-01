/*
 *
 * A bot that attacks the player that sends a message
 *
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node attack.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'attack',
  password: process.argv[5]
})

bot.on('spawn', () => {
  bot.on('chat', (username, message) => {
    if (message !== 'attack me') return
    const player = bot.players[username]
    if (!player.entity) {
      bot.chat(`I can't see you`)
    } else {
      bot.attack(player.entity)
    }
  })
})
