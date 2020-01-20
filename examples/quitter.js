/*
 * This is one of the simplest examples.
 *
 * We created a simple bot that connects to a server and immediately quits.
 *
 * It's not very useful yet, but you can use this as a starting point
 * to create your own bot.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node quitter.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'emobot',
  password: process.argv[5]
})

bot.once('spawn', () => {
  bot.chat('Goodbye, cruel world!')
  bot.quit()
})
