const assert = require('assert')
const Dispenser = require('../dispenser')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  function openDispenser (dispenserBlock) {
    assert.strictEqual(dispenserBlock.name, 'dispenser')
    const dispenser = bot.openBlock(dispenserBlock, Dispenser)
    dispenser.deposit = callbackify(deposit)
    dispenser.withdraw = callbackify(withdraw)
    return dispenser
    async function deposit (itemType, metadata, count) {
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
      await bot.transfer(options)
    }

    async function withdraw (itemType, metadata, count) {
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
      await bot.transfer(options)
    }
  }

  bot.openDispenser = openDispenser
}
