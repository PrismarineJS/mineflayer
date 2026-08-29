const mineflayer = require('mineflayer')
const { once } = require('../../lib/promise_utils')

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
    try {
      await bot.test.serverReads(spawnBot.username)
      break
    } catch (err) {
      if (attempt >= 3) throw err
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
