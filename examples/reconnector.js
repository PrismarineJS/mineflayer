/*
 * This example will automatically reconnect when it gets disconnected from the server.
 */
import { createBot as _createBot } from 'mineflayer'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node reconnector.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

function createBot () {
  const bot = _createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'reconnector',
    password: process.argv[5]
  })

  bot.on('error', (err) => console.log(err))
  bot.on('end', createBot)
}

createBot()
