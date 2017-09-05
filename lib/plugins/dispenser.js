const assert = require('assert')
const Dispenser = require('../dispenser')

module.exports = inject

function inject (bot, { version }) {
  const windows = require('prismarine-windows')(version).windows

  function openDispenser (dispenserBlock) {
    assert.strictEqual(dispenserBlock.type, 23)
    const dispenser = bot.openBlock(dispenserBlock, Dispenser)
    dispenser.deposit = deposit
    dispenser.withdraw = withdraw
    return dispenser
    function deposit (itemType, metadata, count, cb) {
      const options = {
        window: dispenser.window,
        itemType,
        metadata,
        count,
        sourceStart: dispenser.window.inventorySlotStart,
        sourceEnd: dispenser.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
        destStart: 0,
        destEnd: dispenser.window.inventorySlotStart
      }
      bot.transfer(options, cb)
    }

    function withdraw (itemType, metadata, count, cb) {
      const options = {
        window: dispenser.window,
        itemType,
        metadata,
        count,
        sourceStart: 0,
        sourceEnd: dispenser.window.inventorySlotStart,
        destStart: dispenser.window.inventorySlotStart,
        destEnd: dispenser.window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT
      }
      bot.transfer(options, cb)
    }
  }

  bot.openDispenser = openDispenser
}
