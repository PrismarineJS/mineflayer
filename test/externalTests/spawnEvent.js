const mineflayer = require('mineflayer')
const { once } = require('events')

module.exports = () => async (bot) => {
  // Test spawn event on login
  const spawnBot = mineflayer.createBot({
    username: 'spawnbot',
    viewDistance: 'tiny',
    port: bot.test.port,
    host: 'localhost',
    version: bot.version
  })
  await once(spawnBot, 'spawn')
  spawnBot.end()

  // Test spawn event on death
  bot.test.sayEverywhere(`/kill ${bot.username}`)
  await once(bot, 'spawn')
}
