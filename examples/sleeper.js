/*
 * Even bots need to rest sometimes.
 *
 * That's why we created an example that demonstrates how easy it is
 * to find and use a bed properly.
 *
 * You can ask the bot to sleep or wake up by sending a chat message.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node sleeper.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'sleeper',
  password: process.argv[5],
  verbose: true
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'sleep':
      goToSleep()
      break
    case 'wakeup':
      wakeUp()
      break
  }
})

bot.on('sleep', () => {
  bot.chat('Good night!')
})
bot.on('wake', () => {
  bot.chat('Good morning!')
})

function goToSleep () {
  const bed = bot.findBlock({
    matching: 26
  })
  if (bed) {
    bot.sleep(bed, (err) => {
      if (err) {
        bot.chat(`I can't sleep: ${err.message}`)
      } else {
        bot.chat("I'm sleeping")
      }
    })
  } else {
    bot.chat('No nearby bed')
  }
}

function wakeUp () {
  bot.wake((err) => {
    if (err) {
      bot.chat(`I can't wake up: ${err.message}`)
    } else {
      bot.chat('I woke up')
    }
  })
}
