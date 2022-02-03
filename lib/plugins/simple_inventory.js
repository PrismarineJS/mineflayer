const assert = require('assert')

module.exports = inject

const QUICK_BAR_COUNT = 9
const QUICK_BAR_START = 36

function inject (bot) {
  let nextQuickBarSlot = 0

  const armorSlots = {
    head: 5,
    torso: 6,
    legs: 7,
    feet: 8
  }

  if (!bot.supportFeature('doesntHaveOffHandSlot')) {
    armorSlots['off-hand'] = 45
  }

  async function tossStack (item) {
    assert.ok(item)
    await bot.clickWindow(item.slot, 0, 0)
    await bot.clickWindow(-999, 0, 0)
    bot.closeWindow(bot.currentWindow || bot.inventory)
  }

  async function toss (itemType, metadata, count) {
    const window = bot.currentWindow || bot.inventory
    const options = {
      window,
      itemType,
      metadata,
      count,
      sourceStart: window.inventoryStart,
      sourceEnd: window.inventoryEnd,
      destStart: -999
    }
    await bot.transfer(options)
  }

  async function unequip (destination) {
    if (destination === 'hand') {
      await equipEmpty()
    } else {
      await disrobe(destination)
    }
  }

  function setQuickBarSlot (slot) {
    assert.ok(slot >= 0)
    assert.ok(slot < 9)
    if (bot.quickBarSlot === slot) return
    bot.quickBarSlot = slot
    bot._client.write('held_item_slot', {
      slotId: slot
    })
    bot.updateHeldItem()
  }

  async function equipEmpty () {
    for (let i = 0; i < QUICK_BAR_COUNT; ++i) {
      if (!bot.inventory.slots[QUICK_BAR_START + i]) {
        setQuickBarSlot(i)
        return
      }
    }
    const slot = bot.inventory.firstEmptyInventorySlot()
    if (!slot) {
      await bot.tossStack(bot.heldItem)
      return
    }
    const equipSlot = QUICK_BAR_START + bot.quickBarSlot
    await bot.clickWindow(equipSlot, 0, 0)
    await bot.clickWindow(slot, 0, 0)
    if (bot.inventory.selectedItem) {
      await bot.clickWindow(-999, 0, 0)
    }
  }

  async function disrobe (destination) {
    assert.strictEqual(bot.currentWindow, null)
    const destSlot = getDestSlot(destination)
    await bot.putAway(destSlot)
  }

  async function equip (item, destination) {
    if (typeof item === 'number') {
      item = bot.inventory.findInventoryItem(item)
    }
    if (item == null || typeof item !== 'object') {
      throw new Error('Invalid item object in equip (item is null or typeof item is not object)')
    }
    if (!destination || destination === null) {
      destination = 'hand'
    }
    const sourceSlot = item.slot
    let destSlot = getDestSlot(destination)

    if (sourceSlot === destSlot) {
      // don't need to do anything
      return
    }

    if (destination !== 'hand') {
      await bot.moveSlotItem(sourceSlot, destSlot)
      return
    }

    if (destSlot >= QUICK_BAR_START && destSlot < (QUICK_BAR_START + QUICK_BAR_COUNT) && sourceSlot >= QUICK_BAR_START && sourceSlot < (QUICK_BAR_START + QUICK_BAR_COUNT)) {
      // all we have to do is change the quick bar selection
      bot.setQuickBarSlot(sourceSlot - QUICK_BAR_START)
      return
    }

    // find an empty slot on the quick bar to put the source item in
    destSlot = bot.inventory.firstEmptySlotRange(QUICK_BAR_START, QUICK_BAR_START + QUICK_BAR_COUNT)
    if (destSlot == null) {
      // LRU cache for the quick bar items
      destSlot = QUICK_BAR_START + nextQuickBarSlot
      nextQuickBarSlot = (nextQuickBarSlot + 1) % QUICK_BAR_COUNT
    }
    setQuickBarSlot(destSlot - QUICK_BAR_START)
    await bot.moveSlotItem(sourceSlot, destSlot)
  }

  function getDestSlot (destination) {
    if (destination === 'hand') {
      return QUICK_BAR_START + bot.quickBarSlot
    } else {
      const destSlot = armorSlots[destination]
      assert.ok(destSlot != null, `invalid destination: ${destination}`)
      return destSlot
    }
  }

  function leftMouse (slot) {
    return bot.clickWindow(slot, 0, 0)
  }

  function rightMouse (slot) {
    return bot.clickWindow(slot, 1, 0)
  }

  bot.equip = equip
  bot.unequip = unequip
  bot.toss = toss
  bot.tossStack = tossStack
  bot.setQuickBarSlot = setQuickBarSlot
  bot.getEquipmentDestSlot = getDestSlot
  bot.simpleClick = { leftMouse, rightMouse }

  // constants
  bot.QUICK_BAR_START = QUICK_BAR_START
}
