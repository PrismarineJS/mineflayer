const mineflayer = require('mineflayer')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test spawn event on login
  const spawnBot = mineflayer.createBot({
    username: 'spawnbot',
    viewDistance: 'tiny',
    port: bot.test.port,
    host: '127.0.0.1',
    version: bot.version
  })
  await once(spawnBot, 'spawn')
  spawnBot.end()

  // Wait for spawnbot to fully disconnect before killing flatbot
  // This prevents the server from trying to send death messages to a disconnecting client
  await new Promise(resolve => setTimeout(resolve, 100))

  // Test spawn event on death
  bot.test.sayEverywhere(`/kill ${bot.username}`)
  await once(bot, 'spawn')
}
