const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'bot'
})

bot.on('chat', (u, m, cm, jsonMsg) => {
  console.log(u, m, cm, jsonMsg)
})
