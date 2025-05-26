/**
 *A simple bot that greets new players when they join the server.
 */
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // replace with your server's host
  port: 25565,
  username: 'GreeterBot' // this is the bot's username
})

// this event is triggered when a player joins the server
bot.on('playerJoined', (player) => {
  if (player.username !== bot.username) {
    bot.chat(`Hello, ${player.username}!`) // this is the greeting message
  }
})