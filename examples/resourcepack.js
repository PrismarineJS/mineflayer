/*
 *
 * A simple bot that accepts a resource pack sent by a server
 *
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node resourcepack.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'packbot',
  password: process.argv[5]
})

bot.once('resourcePack', () => { // resource pack sent by server
  bot.acceptResourcePack()
})
