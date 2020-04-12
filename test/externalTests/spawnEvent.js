const assert = require('assert')
const mineflayer = require('../../')

module.exports = () => (bot, done) => {
  const spawnHandler = (timeout, client, cb) => {
    clearTimeout(timeout)
    if (client) client.end()
    cb()
  }

  const spawnEventTest = [
    cb => {
      // Test spawn event on login
      const spawnBot = mineflayer.createBot({
        username: 'spawnbot',
        viewDistance: 'tiny',
        port: bot.test.port,
        host: 'localhost',
        version: bot.version
      })

      const timeout = setTimeout(() => {
        spawnBot.removeListener('spawn', spawnHandler)
        spawnBot.end()
        assert.fail("spawn event wasn't triggered on connection")
        cb()
      }, 4000)

      spawnBot.once('spawn', () => {
        spawnHandler(timeout, spawnBot, cb)
      })
    },
    cb => {
      // Test spawn event on death
      bot.test.sayEverywhere(`/kill ${bot.username}`)
      const timeout = setTimeout(() => {
        bot.removeListener('spawn', spawnHandler)
        assert.fail("spawn event wasn't triggered on death")
        cb()
      }, 4000)

      bot.once('spawn', () => {
        spawnHandler(timeout, null, cb)
      })
    }
  ]

  bot.test.callbackChain(spawnEventTest, done)
}
