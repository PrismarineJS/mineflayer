/*
 * An example of how to handle title events from the server.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node titles.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'titles',
  password: process.argv[5]
})

// This event is triggered when the server sends a title to the client.
bot.on('title', (text, type) => {
  // type is either "title" or "subtitle"
  console.log(`Received ${type}: ${text}`)
})
