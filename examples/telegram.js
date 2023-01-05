/*
* This example is a very simple way of connecting to a telegram group
* For this example you'll need Telegraf installed. This can be done with `npm install telegraf`
* You need to do this before running this example:
* - You need to get a telegram bot token from @botfather
* - You need to get the id of the group you want to use
*/

if (process.argv.length < 6 || process.argv.length > 8) {
  console.log('Usage : node telegram.js <telegram bot token> <group id> <host> <port> [<name>] [<password>]')
  process.exit(1)
}

// Load Telegraf
const { Telegraf } = require('telegraf')
const telegram = new Telegraf(process.argv[2])

// Load mineflayer
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: process.argv[4],
  port: parseInt(process.argv[5]),
  username: process.argv[6] || 'telegram',
  password: process.argv[7]
})

telegram.on('text', async (ctx) => {
  // check if message was reveived from chosen group
  if (ctx.update.message.chat.id.toString() === process.argv[3]) {
    // send message to mc server
    bot.chat(`${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name}: ${ctx.update.message.text}`)
  }
})

// Redirect in-game messages to telegram group
bot.on('chat', (username, message) => {
  // Ignore messages from the bot itself
  if (username === bot.username) return
  telegram.telegram.sendMessage(process.argv[3], username + ': ' + message)
})

// Login telegram bot
telegram.launch()
