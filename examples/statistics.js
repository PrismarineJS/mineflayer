const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  username: 'KaffinPX',
  version: '1.12.2'
})

bot.on('spawn', () => {
  bot.requestStatistics().then((data) => {
    console.log(data)
  })
})
