// this example is to show the different ways to parse chat messages

/*
Expected output in console:

bot has just joined!
bot has just left!
bot has just rejoined!
bot has just left!
*/
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: 'localhost',
  username: 'bot1'
})

bot.once('spawn', () => {
  bot.addChatPattern('bot_left_the_game', /bot left the game/)
  bot.addChatPatternSet('bot_rejoins_the_game', [/bot left the game/, /bot joined the game/])
  bot.addChatPattern('who_just_joined', /(.+) joined the game/, { parse: true, repeat: false })
  makeChatMessages()
})

bot.on('chat:bot_left_the_game', matches => {
  if (matches[0] === 'bot left the game') {
    console.log('bot has just left!')
  }
})

bot.on('chat:bot_rejoins_the_game', matches => {
  if (matches[0] === 'bot left the game' && matches[1] === 'bot joined the game') {
    console.log('bot has just rejoined!')
  }
})

bot.on('chat:who_just_joined', matches => {
  console.log(`${matches[0]} has just joined!`) // should only run once
})

async function makeChatMessages () {
  let bot1, bot2
  setTimeout(() => {
    bot1 = mineflayer.createBot({
      host: 'localhost',
      username: 'bot'
    })
  }, 1000)
  setTimeout(() => bot1.quit(), 1500)
  setTimeout(() => {
    bot2 = mineflayer.createBot({
      host: 'localhost',
      username: 'bot'
    }, 2000)
  })
  setTimeout(() => bot2.quit(), 2500)
}
