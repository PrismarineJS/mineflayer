/* eslint-env mocha */

const assert = require('assert')
const { EventEmitter } = require('events')

describe('villager listener cleanup (issue #4225)', () => {
  function makeBot () {
    const bot = new EventEmitter()
    bot.registry = { entitiesByName: { villager: { id: 1 } } }
    bot.supportFeature = () => false
    bot._client = new EventEmitter()
    return bot
  }

  const tradePackets = ['trade_list']

  function listenerCount (bot) {
    return tradePackets.reduce((n, name) => n + bot._client.listenerCount(name), 0)
  }

  it('removes the trade listener when openEntity rejects', async () => {
    const bot = makeBot()
    bot.openEntity = async () => { throw new Error('open failed') }
    const inject = require('../lib/plugins/villager')
    inject(bot, { version: '1.20.4' })

    const entity = { entityType: 1 }
    await assert.rejects(bot.openVillager(entity), /open failed/)
    assert.strictEqual(listenerCount(bot), 0, 'trade listener leaked after rejection')
  })

  it('does not throw unhandled rejections when a trade packet arrives before rejection', async () => {
    const bot = makeBot()

    let rejectOpen
    bot.openEntity = () => new Promise((resolve, reject) => { rejectOpen = reject })

    const inject = require('../lib/plugins/villager')
    inject(bot, { version: '1.20.4' })

    const entity = { entityType: 1 }

    const unhandled = []
    const onUnhandled = (err) => unhandled.push(err)
    process.on('unhandledRejection', onUnhandled)

    const pending = bot.openVillager(entity)
    bot._client.emit('trade_list', { windowId: 999 })
    rejectOpen(new Error('open failed'))
    await assert.rejects(pending, /open failed/)

    await new Promise(resolve => setImmediate(resolve))

    process.off('unhandledRejection', onUnhandled)
    assert.strictEqual(unhandled.length, 0, 'unhandled rejection leaked from gotTrades')
    assert.strictEqual(listenerCount(bot), 0, 'trade listener leaked after rejection')
  })

  it('removes the trade listener when type validation fails', async () => {
    const bot = makeBot()

    const window = { type: 'minecraft:chest', id: 1, once () {}, trade: null }
    bot.openEntity = async () => window

    const inject = require('../lib/plugins/villager')
    inject(bot, { version: '1.20.4' })

    const entity = { entityType: 1 }
    await assert.rejects(bot.openVillager(entity), /Expected minecraft:villager or minecraft:mechant/)
    assert.strictEqual(listenerCount(bot), 0, 'trade listener leaked after type validation failure')
  })
})