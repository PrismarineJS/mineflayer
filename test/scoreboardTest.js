/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events').EventEmitter
const registryLoader = require('prismarine-registry')

// The scoreboard plugin only needs a registry, a packet source and an event bus, so it can be
// driven straight off the wire shapes without standing up a server.
function fakeBot (version) {
  const bot = new EventEmitter()
  bot.registry = registryLoader(version)
  bot._client = new EventEmitter()
  bot.teamMap = {}
  require('../lib/plugins/scoreboard')(bot)
  return bot
}

function createObjective (bot, name, displayText) {
  bot._client.emit('scoreboard_objective', { name, action: 0, displayText })
  bot._client.emit('scoreboard_display_objective', { name, position: 1 })
}

describe('scoreboard', () => {
  describe('1.20.2 and older (scoreboard_score carries an action)', () => {
    it('tracks scores and removals, and reads a JSON title', () => {
      const bot = fakeBot('1.20.2')
      createObjective(bot, 'objective', '{"text":"Leaderboard"}')
      assert.strictEqual(bot.scoreboard.sidebar.title.toString(), 'Leaderboard')

      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'objective', action: 0, value: 3 })
      bot._client.emit('scoreboard_score', { itemName: 'dzikoysk', scoreName: 'objective', action: 0, value: 6 })
      assert.deepStrictEqual(bot.scoreboard.sidebar.items.map(i => [i.name, i.value]), [['dzikoysk', 6], ['wvffle', 3]])

      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'objective', action: 1 })
      assert.deepStrictEqual(bot.scoreboard.sidebar.items.map(i => i.name), ['dzikoysk'])
    })
  })

  describe('1.20.3+ (scoreboard_score lost its action, reset_score took over removals)', () => {
    it('tracks scores sent without an action', () => {
      const bot = fakeBot('1.21.4')
      createObjective(bot, 'objective', { type: 'compound', value: { text: { type: 'string', value: 'BedWars' } } })
      assert.strictEqual(bot.scoreboard.sidebar.title.toString(), 'BedWars')

      const seen = []
      bot.on('scoreUpdated', (sb, item) => seen.push([sb.name, item.name, item.value]))
      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'objective', value: 3 })
      bot._client.emit('scoreboard_score', { itemName: 'dzikoysk', scoreName: 'objective', value: 6 })

      assert.deepStrictEqual(bot.scoreboard.sidebar.items.map(i => [i.name, i.value]), [['dzikoysk', 6], ['wvffle', 3]])
      assert.deepStrictEqual(seen, [['objective', 'wvffle', 3], ['objective', 'dzikoysk', 6]])
    })

    it('renders the per-score display name the server sends', () => {
      const bot = fakeBot('1.21.4')
      createObjective(bot, 'objective', { type: 'compound', value: { text: { type: 'string', value: 'BedWars' } } })
      bot._client.emit('scoreboard_score', {
        itemName: 'green',
        scoreName: 'objective',
        value: 1,
        display_name: { type: 'compound', value: { text: { type: 'string', value: 'Green: alive' } } }
      })
      assert.strictEqual(bot.scoreboard.sidebar.items[0].displayName.toString(), 'Green: alive')
    })

    it('falls back to the entry name when no display name is sent', () => {
      const bot = fakeBot('1.21.4')
      createObjective(bot, 'objective', { type: 'compound', value: { text: { type: 'string', value: 'BedWars' } } })
      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'objective', value: 1 })
      assert.strictEqual(bot.scoreboard.sidebar.items[0].displayName.toString(), 'wvffle')
    })

    it('reset_score removes the entry from one objective', () => {
      const bot = fakeBot('1.21.4')
      createObjective(bot, 'objective', { type: 'compound', value: { text: { type: 'string', value: 'BedWars' } } })
      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'objective', value: 3 })
      bot._client.emit('scoreboard_score', { itemName: 'dzikoysk', scoreName: 'objective', value: 6 })

      const removed = []
      bot.on('scoreRemoved', (sb, item) => removed.push(item.name))
      bot._client.emit('reset_score', { entity_name: 'wvffle', objective_name: 'objective' })

      assert.deepStrictEqual(removed, ['wvffle'])
      assert.deepStrictEqual(bot.scoreboard.sidebar.items.map(i => i.name), ['dzikoysk'])
    })

    it('reset_score without an objective clears the entry everywhere', () => {
      const bot = fakeBot('1.21.4')
      createObjective(bot, 'a', { type: 'compound', value: { text: { type: 'string', value: 'A' } } })
      bot._client.emit('scoreboard_objective', { name: 'b', action: 0, displayText: { type: 'compound', value: { text: { type: 'string', value: 'B' } } } })
      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'a', value: 3 })
      bot._client.emit('scoreboard_score', { itemName: 'wvffle', scoreName: 'b', value: 4 })

      bot._client.emit('reset_score', { entity_name: 'wvffle', objective_name: undefined })

      assert.deepStrictEqual(bot.scoreboards.a.items, [])
      assert.deepStrictEqual(bot.scoreboards.b.items, [])
    })
  })

  describe('titles', () => {
    it('keeps the whole component, not just the first text run', () => {
      const bot = fakeBot('1.21.4')
      createObjective(bot, 'objective', {
        type: 'compound',
        value: {
          text: { type: 'string', value: '' },
          extra: {
            type: 'list',
            value: {
              type: 'compound',
              value: [
                { text: { type: 'string', value: 'Bed' } },
                { text: { type: 'string', value: 'Wars' } }
              ]
            }
          }
        }
      })
      assert.strictEqual(bot.scoreboard.sidebar.title.toString(), 'BedWars')
    })

    it('reads a plain-string title from 1.8', () => {
      const bot = fakeBot('1.8.8')
      createObjective(bot, 'objective', 'Leaderboard')
      assert.strictEqual(bot.scoreboard.sidebar.title.toString(), 'Leaderboard')
    })
  })
})
