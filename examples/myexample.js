const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'bot'
})

bot.once('spawn', () => {
  bot.addChatPattern('theTest', /<.+> Hello World(!!!!)/, { repeat: false, parse: true })
})

bot.on('chat:theTest', console.log)

// bot.on('chat', console.log)
