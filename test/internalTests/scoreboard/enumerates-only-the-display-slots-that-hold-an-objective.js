const assert = require('assert')
const { once } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  server.on('playerJoin', (client) => client.write('login', bot.test.generateLoginPacket()))
  await once(bot, 'login')
  bot._client.emit('scoreboard_objective', { name: 'test1', action: 0, displayText: JSON.stringify({ text: 'Test 1' }) })
  bot._client.emit('scoreboard_display_objective', { name: 'test1', position: 1 })
  assert.strictEqual(bot.scoreboard.sidebar, bot.scoreboards.test1)
  assert.strictEqual(bot.scoreboard.list, undefined)
  assert.deepStrictEqual(Object.keys(bot.scoreboard), ['1'])
  assert.ok(Object.values(bot.scoreboard).every(sb => sb !== undefined))
  assert.doesNotThrow(() => { for (const sb of Object.values(bot.scoreboard)) assert.strictEqual(sb.title, 'Test 1') })
  bot._client.emit('scoreboard_objective', { name: 'test1', action: 1 })
  assert.deepStrictEqual(Object.keys(bot.scoreboard), [])
  assert.strictEqual(bot.scoreboard.sidebar, undefined)
}
