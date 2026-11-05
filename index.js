const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: process.env.MC_SERVER_HOST,
  port: Number(process.env.MC_SERVER_PORT || 25565),
  username: 'FrostBot',
  auth: 'offline'
})

bot.on('login', () => console.log('Bot joined server!'))
bot.on('error', console.log)
bot.on('end', () => console.log('Bot disconnected'))
