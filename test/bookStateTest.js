/* eslint-env mocha */

const assert = require('assert')
const { EventEmitter } = require('events')
const injectBook = require('../lib/plugins/book')

function makeBot () {
  const inventory = new EventEmitter()
  inventory.slots = new Array(46).fill(null)
  inventory.updateSlot = (slot, item) => {
    inventory.slots[slot] = item
    inventory.emit(`updateSlot:${slot}`, null, item)
  }

  const bot = {
    registry: require('prismarine-registry')('1.20.4'),
    inventory,
    quickBarSlot: 4,
    moves: [],
    quickBarChanges: [],
    supportFeature: name => {
      if (name === 'hasEditBookPacket') return true
      return false
    },
    moveSlotItem: async (from, to) => {
      bot.moves.push([from, to])
      const item = inventory.slots[from]
      inventory.slots[from] = null
      inventory.slots[to] = item
      if (item) item.slot = to
    },
    setQuickBarSlot: slot => {
      bot.quickBarChanges.push(slot)
      bot.quickBarSlot = slot
    },
    _syncWindow: async () => {},
    _client: {
      write: () => {
        throw new Error('send failed')
      }
    }
  }

  const book = {
    type: bot.registry.itemsByName.writable_book.id,
    count: 1,
    slot: 30
  }
  inventory.slots[30] = book
  injectBook(bot)
  return bot
}

describe('book write state restoration', () => {
  it('restores the selected slot and moved book when edit_book fails', async () => {
    const bot = makeBot()

    await assert.rejects(bot.writeBook(30, ['page']), /send failed/)

    assert.strictEqual(bot.quickBarSlot, 4)
    assert.deepStrictEqual(bot.quickBarChanges, [0, 4])
    assert.deepStrictEqual(bot.moves, [[30, 36], [36, 30]])
    assert.strictEqual(bot.inventory.slots[30].slot, 30)
    assert.strictEqual(bot.inventory.slots[36], null)
  })

  it('moves the book back when window sync fails before selecting the hotbar slot', async () => {
    const bot = makeBot()
    bot._syncWindow = async () => {
      throw new Error('sync failed')
    }

    await assert.rejects(bot.writeBook(30, ['page']), /sync failed/)

    assert.strictEqual(bot.quickBarSlot, 4)
    assert.deepStrictEqual(bot.quickBarChanges, [])
    assert.deepStrictEqual(bot.moves, [[30, 36], [36, 30]])
    assert.strictEqual(bot.inventory.slots[30].slot, 30)
    assert.strictEqual(bot.inventory.slots[36], null)
  })
})
