/*
 * This example is a very simple way how to connect a discord bot with a mineflayer bot.
 * For this example you will need discord.js installed. You can install with: npm install discord.js
 * This example uses discord.js v14
 * You need to do this before running this example:
 * - You need to get a discord bot token
 * - You need to get the id of the channel you want to use
 *
 * Original credit to U9G, updated by Jovan04 12/19/2022
*/

if (process.argv.length < 6 || process.argv.length > 8) {
  console.log('Usage : node discord.js <discord bot token> <channel id> <host> <port> [<name>] [<auth>]')
  process.exit(1)
}

// load discord.js
const { Client, GatewayIntentBits } = require('discord.js')
const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits

let channel = process.argv[3]
const token = process.argv[2]

// create new discord client that can see what servers the bot is in, as well as the messages in those servers
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] })
client.login(token)

// load mineflayer
const mineflayer = require('mineflayer')

// bot options
const options = {
  host: process.argv[4],
  port: parseInt(process.argv[5]),
  username: process.argv[6] || 'discord',
  auth: process.argv[7] || 'offline'
}

// join server
const bot = mineflayer.createBot(options)
bot.on('spawn', () => {
  console.log(`Mineflayer bot logged in as ${bot.username}`)
})

// when discord client is ready, send login message
client.once('ready', (c) => {
  console.log(`Discord bot logged in as ${c.user.tag}`)
  channel = client.channels.cache.get(channel)
  if (!channel) {
    console.log(`I could not find the channel (${process.argv[3]})!`)
    console.log('Usage : node discord.js <discord bot token> <channel id> <host> <port> [<name>] [<auth>]')
    process.exit(1)
  }
})

client.on('messageCreate', (message) => {
  // Only handle messages in specified channel
  if (message.channel.id !== channel.id) return
  // Ignore messages from the bot itself
  if (message.author.id === client.user.id) return
  // console.log(message)
  bot.chat(`${message.author.username}: ${message.content}`)
})

// Redirect in-game messages to Discord channel
bot.on('chat', (username, message) => {
  // Ignore messages from the bot itself
  if (username === bot.username) return

  channel.send(`${username}: ${message}`)
})
