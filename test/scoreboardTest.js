/* eslint-env mocha */

const assert = require('assert')
const { EventEmitter } = require('events')
const injectScoreboard = require('../lib/plugins/scoreboard')

function makeBot () {
  const bot = new EventEmitter()
  bot._client = new EventEmitter()
  bot.registry = require('prismarine-registry')('1.20.4')
  bot.teamMap = {}
  injectScoreboard(bot)
  return bot
}

function createScoreboard (bot, name = 'objective') {
  bot._client.emit('scoreboard_objective', {
    name,
    action: 0,
    displayText: JSON.stringify({ text: name })
  })
  return bot.scoreboards[name]
}

describe('scoreboard display cleanup', () => {
  it('removes a deleted objective from every display slot', () => {
    const bot = makeBot()
    const scoreboard = createScoreboard(bot)

    bot._client.emit('scoreboard_display_objective', { name: scoreboard.name, position: 0 })
    bot._client.emit('scoreboard_display_objective', { name: scoreboard.name, position: 1 })

    assert.strictEqual(bot.scoreboard.list, scoreboard)
    assert.strictEqual(bot.scoreboard.sidebar, scoreboard)

    bot._client.emit('scoreboard_objective', { name: scoreboard.name, action: 1 })

    assert.strictEqual(bot.scoreboard.list, undefined)
    assert.strictEqual(bot.scoreboard.sidebar, undefined)
  })

  it('clears a display slot when the server sends an empty objective name', () => {
    const bot = makeBot()
    const scoreboard = createScoreboard(bot)
    let update

    bot._client.emit('scoreboard_display_objective', { name: scoreboard.name, position: 1 })
    bot.once('scoreboardPosition', (...args) => { update = args })

    bot._client.emit('scoreboard_display_objective', { name: '', position: 1 })

    assert.strictEqual(bot.scoreboard.sidebar, undefined)
    assert.deepStrictEqual(update, [1, undefined, scoreboard])
  })
})
