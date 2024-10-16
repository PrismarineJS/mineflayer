/*
 * This is one of the simplest examples.
 *
 * We created a simple bot that echoes back everything that is said on chat.
 *
 * It's not very useful yet, but you can use this as a starting point
 * to create your own bot.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node echo.js <host> <port> [<name>] [online?]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'echo',
  auth: process.argv[5] ? 'microsoft' : 'offline'
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  bot.chat(message)
})

bot.on('kicked', (reason) => {
  console.log('I was kicked from the server: ' + reason)
})
