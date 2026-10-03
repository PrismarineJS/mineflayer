const assert = require('assert')

module.exports = inject

function inject(bot) {
  const allowedWindowTypes = ['minecraft:cartography']

  function matchWindowType(window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openCartographyTable(cartographyTableBlock) {
    const cartographyTable = await bot.openBlock(cartographyTableBlock)
    if (!matchWindowType(cartographyTable)) {
      throw new Error('This is not a cartographyTable-like window')
    }

    cartographyTable.takeMap = takeMap
    cartographyTable.takeModifier = takeModifier
    cartographyTable.takeOutput = takeOutput
    cartographyTable.putMap = putMap
    cartographyTable.putModifier = putModifier
    cartographyTable.mapItem = function () { return this.slots[0] }
    cartographyTable.modifierItem = function () { return this.slots[1] }
    cartographyTable.outputItem = function () { return this.slots[2] }

    return cartographyTable

    async function takeSomething(item) {
      assert.ok(item)
      await bot.putAway(item.slot)
      return item
    }

    async function takeMap() {
      return takeSomething(cartographyTable.mapItem())
    }

    async function takeModifier() {
      return takeSomething(cartographyTable.modifierItem())
    }

    async function takeOutput() {
      return takeSomething(cartographyTable.outputItem())
    }

    async function putSomething(destSlot, itemType, metadata, count) {
      const options = {
        window: cartographyTable,
        itemType,
        metadata,
        count,
        sourceStart: cartographyTable.inventoryStart,
        sourceEnd: cartographyTable.inventoryEnd,
        destStart: destSlot,
        destEnd: destSlot + 1
      }
      await bot.transfer(options)
    }

    async function putMap(itemType, metadata, count) {
      await putSomething(0, itemType, metadata, count)
    }

    async function putModifier(itemType, metadata, count) {
      await putSomething(1, itemType, metadata, count)
    }
  }

  bot.openCartographyTable = openCartographyTable

}
