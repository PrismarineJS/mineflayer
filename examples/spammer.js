/*
 *
 * A bot that only spams
 *
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node spammer.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'spammer',
  password: process.argv[5]
})

bot.on('spawn', () => {
  setInterval(() => {
    bot.chat('I am spamming') 
  }, 1000)
})
