// this example is to show the different ways to parse chat messages
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'bot1'
})

bot.once('spawn', () => {
  bot.addChatPattern('bot_left_the_game', /bot left the game/)
  bot.addChatPatternSet('bot_rejoins_the_game', [/bot left the game/, /bot joined the game/])
  bot.addChatPattern('who_just_joined', /(.+) joined the game/, { parse: true })
  makeChatMessages()
})

bot.on('chat:bot_left_the_game', matches => {
  console.log(matches) // => [ 'bot left the game' ]
})

bot.on('chat:bot_rejoins_the_game', matches => {
  console.log(matches) // => [ 'bot left the game', 'bot joined the game' ]
})

bot.on('chat:who_just_joined', matches => {
  console.log(`${matches[0]} has just joined!`)
})

function makeChatMessages () {
  setTimeout(() => {
    const bot1 = mineflayer.createBot({
      host: 'localhost',
      username: 'bot'
    })
    setTimeout(() => {
      bot1.quit()
    }, 500)
    setTimeout(() => {
      const bot1 = mineflayer.createBot({
        host: 'localhost',
        username: 'bot'
      })
    }, 1000)
  }, 1000)
}
