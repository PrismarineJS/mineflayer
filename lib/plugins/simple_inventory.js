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

  // An open window lists the player's inventory after its own slots, in the
  // same order from inventory slot 9 on, so inventory slot n is window slot
  // n - 9 + inventoryStart there. The hotbar and armour numbers of
  // bot.inventory name other slots of that window.
  function windowSlot (slot) {
    const window = bot.currentWindow
    if (!window) return slot
    assert.ok(slot >= 9 && slot <= 44, `inventory slot ${slot} is not in the open window`)
    return slot - 9 + window.inventoryStart
  }

  async function tossStack (item) {
    assert.ok(item)
    const window = bot.currentWindow
    // An item of bot.inventory has an inventory slot number, one of the open
    // window has that window's
    const slot = window && bot.inventory.slots[item.slot] === item ? windowSlot(item.slot) : item.slot
    await bot.clickWindow(slot, 0, 0)
    await bot.clickWindow(-999, 0, 0)
    // a window the caller opened stays open
    if (!window) await bot.closeWindow(bot.inventory)
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
    bot._ensureHasSentCarriedItem()
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
    let sourceSlot = item.slot
    const window = bot.currentWindow
    if (window && window.slots[item.slot] === item) {
      // an item of the open window has that window's slot number
      assert.ok(item.slot >= window.inventoryStart && item.slot < window.inventoryEnd, 'equip takes an item of the player inventory')
      sourceSlot = item.slot - window.inventoryStart + 9
    }
    let destSlot = getDestSlot(destination)

    if (sourceSlot === destSlot) {
      // don't need to do anything
      return
    }

    if (destination !== 'hand') {
      // the armour and off hand slots are not in another window
      if (bot.currentWindow) throw new Error(`cannot equip to ${destination} while a window is open`)
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
    await bot.moveSlotItem(windowSlot(sourceSlot), windowSlot(destSlot))
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
