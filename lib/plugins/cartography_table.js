const assert = require('assert')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:cartography', 'minecraft:generic', 'minecraft:generic_9']

  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openCartographyTable (cartographyTableBlock) {
    const cartographyTable = await bot.openBlock(cartographyTableBlock)
    if (!matchWindowType(cartographyTable)) {
      throw new Error('This is not a cartographyTable-like window')
    }

    const mapSlot = 0
    const modifierSlot = 1
    const outputSlot = 2

    cartographyTable.takeMap = takeMap
    cartographyTable.takeModifier = takeModifier
    cartographyTable.takeOutput = takeOutput
    cartographyTable.putMap = putMap
    cartographyTable.putModifier = putModifier
    cartographyTable.mapItem = function () { return this.slots[mapSlot] }
    cartographyTable.modifierItem = function () { return this.slots[modifierSlot] }
    cartographyTable.outputItem = function () { return this.slots[outputSlot] }

    return cartographyTable

    async function takeSomething (item) {
      assert.ok(item)
      await bot.putAway(item.slot)
      return item
    }

    async function takeMap () {
      return takeSomething(cartographyTable.mapItem())
    }

    async function takeModifier () {
      return takeSomething(cartographyTable.modifierItem())
    }

    async function takeOutput () {
      return takeSomething(cartographyTable.outputItem())
    }

    async function putMap (itemType, metadata, count) {
      await bot.transfer({
        window: cartographyTable,
        itemType,
        metadata,
        count,
        sourceStart: cartographyTable.inventoryStart,
        sourceEnd: cartographyTable.inventoryEnd,
        destStart: mapSlot,
        destEnd: mapSlot + 1
      })
    }

    async function putModifier (itemType, metadata, count) {
      await bot.transfer({
        window: cartographyTable,
        itemType,
        metadata,
        count,
        sourceStart: cartographyTable.inventoryStart,
        sourceEnd: cartographyTable.inventoryEnd,
        destStart: modifierSlot,
        destEnd: modifierSlot + 1
      })
    }
  }

  bot.openCartographyTable = openCartographyTable
}
