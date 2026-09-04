const mineflayer = require('mineflayer')
const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test spawn event on login
  let spawnBot
  for (let attempt = 1; ; attempt++) {
    spawnBot = mineflayer.createBot({
      username: 'spawnbot',
      viewDistance: 'tiny',
      port: bot.test.port,
      host: '127.0.0.1',
      version: bot.version
    })
    await once(spawnBot, 'spawn')
    // spawnbot logs in at the world spawn, possibly out of flatbot's view, so
    // its entity metadata is no proof of life; a chat line reaching flatbot is.
    spawnBot.chat('spawnbot-alive')
    try {
      await onceWithCleanup(bot, 'chat', {
        timeout: 3000,
        checkCondition: (username, message) => username === spawnBot.username && message === 'spawnbot-alive'
      })
      break
    } catch (err) {
      if (attempt >= 3) throw new Error(`server is not reading ${spawnBot.username}'s socket`)
      spawnBot.end()
    }
  }
  spawnBot.end()

  // Wait for the server to process the disconnection before killing the main bot
  await once(bot, 'playerLeft')

  // Test spawn event on death
  bot.test.sayEverywhere(`/kill ${bot.username}`)
  await once(bot, 'spawn')
}
