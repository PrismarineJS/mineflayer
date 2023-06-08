/*
 *
 * A simple bot that requests statistics.
 *
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node statistics.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'stats',
  password: process.argv[5]
})

bot.on('spawn', () => {
  bot.requestStatistics().then((data) => {
    console.log(data)
  })
})
