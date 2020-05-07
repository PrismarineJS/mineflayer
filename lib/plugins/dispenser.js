const assert = require('assert')
const Dispenser = require('../dispenser')

module.exports = inject

function inject (bot) {
  function openDispenser (dispenserBlock) {
    assert.strictEqual(dispenserBlock.name, 'dispenser')
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
        sourceStart: dispenser.window.inventoryStart,
        sourceEnd: dispenser.window.inventoryEnd,
        destStart: 0,
        destEnd: dispenser.window.inventoryStart
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
        sourceEnd: dispenser.window.inventoryStart,
        destStart: dispenser.window.inventoryStart,
        destEnd: dispenser.window.inventoryEnd
      }
      bot.transfer(options, cb)
    }
  }

  bot.openDispenser = openDispenser
}
