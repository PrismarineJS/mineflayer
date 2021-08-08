/*
 * This example is a very simple way how to connect a discord bot with a mineflayer bot.
 * For this example you will need discord.js installed. You can install with: npm install discord.js
 * Note that discord.js v12 or newer is required.
 * You need to do this before running this example:
 * - You need to get a discord token
 * - You need to get the id of the channel you want to use
 */

if (process.argv.length < 6 || process.argv.length > 8) {
  console.log('Usage : node discord.js <discord bot token> <channel id> <host> <port> [<name>] [<password>]')
  process.exit(1)
}

// Load discord
const Discord = require('discord.js')
const client = new Discord.Client()
let channel = process.argv[3]

// Load mineflayer
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: process.argv[4],
  port: parseInt(process.argv[5]),
  username: process.argv[6] || 'discord',
  password: process.argv[7]
})

client.on('ready', () => {
  console.log(`The discord bot logged in! Username: ${client.user.username}!`)
  channel = client.channels.cache.get(channel)
  if (!channel) {
    console.log(`I could not find the channel (${process.argv[3]})!\nUsage : node discord.js <discord bot token> <channel id> <host> <port> [<name>] [<password>]`)
    process.exit(1)
  }
})

// Redirect Discord messages to in-game chat
client.on('message', message => {
  // Only handle messages in specified channel
  if (message.channel.id !== channel.id) return
  // Ignore messages from the bot itself
  if (message.author.id === client.user.id) return

  bot.chat(`${message.author.username}: ${message.content}`)
})

// Redirect in-game messages to Discord channel
bot.on('chat', (username, message) => {
  // Ignore messages from the bot itself
  if (username === bot.username) return

  channel.send(`${username}: ${message}`)
})

// Login Discord bot
client.login(process.argv[2])
