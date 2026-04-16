const assert = require('assert')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:cartography', 'minecraft:generic']

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
      const sourceSlot = findItemInInventory(itemType, metadata)
      if (sourceSlot === null) {
        throw new Error(`Cannot find item ${itemType} in inventory`)
      }
      await bot.moveSlotItem(sourceSlot, mapSlot)
    }

    async function putModifier (itemType, metadata, count) {
      const sourceSlot = findItemInInventory(itemType, metadata)
      if (sourceSlot === null) {
        throw new Error(`Cannot find item ${itemType} in inventory`)
      }
      await bot.moveSlotItem(sourceSlot, modifierSlot)
    }

    function findItemInInventory (itemType, metadata) {
      const inventory = bot.inventory
      for (let i = inventory.inventoryStart; i < inventory.inventoryEnd; i++) {
        const item = inventory.slots[i]
        if (item && item.type === itemType && (metadata === null || item.metadata === metadata)) {
          return i
        }
      }
      return null
    }
  }

  bot.openCartographyTable = openCartographyTable
}
