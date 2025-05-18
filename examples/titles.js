/*
 * An example of how to handle title events from the server.
 * Demonstrates title, subtitle, timing, and clearing functionality.
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

// This event is triggered when the server sends a title or subtitle
bot.on('title', (text, type) => {
  // type is either "title" or "subtitle"
  console.log(`Received ${type}: ${text}`)
})

// This event is triggered when the server sets title display times
bot.on('title_times', (fadeIn, stay, fadeOut) => {
  console.log(`Title timing: fadeIn=${fadeIn}ms, stay=${stay}ms, fadeOut=${fadeOut}ms`)
})

// This event is triggered when the server clears all titles
bot.on('title_clear', () => {
  console.log('All titles cleared')
})

bot.on('spawn', () => {
  console.log('Bot spawned! Try these commands:')
  console.log('/title @a title {"text":"Hello World"}')
  console.log('/title @a subtitle {"text":"Welcome!"}')
  console.log('/title @a times 10 20 30')
  console.log('/title @a clear')
})
