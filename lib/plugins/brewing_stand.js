const assert = require('assert')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:brewing_stand']

  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openBrewingStand (brewingStandBlock) {
    const brewingStand = await bot.openBlock(brewingStandBlock)
    if (!matchWindowType(brewingStand)) {
      throw new Error('This is not a brewing-stand-like window')
    }

    brewingStand.fuel = null
    brewingStand.progress = null
    brewingStand.progressSeconds = null
    brewingStand.takeIngredient = takeIngredient
    brewingStand.takeFuel = takeFuel
    brewingStand.takePotion = takePotion
    brewingStand.takePotions = takePotions
    brewingStand.putIngredient = putIngredient
    brewingStand.putFuel = putFuel
    brewingStand.putPotion = putPotion
    brewingStand.ingredientItem = function () { return this.slots[3] } // returns ingredient in the top slot
    brewingStand.fuelItem = function () { return this.slots[4] } // returns item in the fuel slot
    brewingStand.potions = function () { return [this.slots[0], this.slots[1], this.slots[2]] } // returns array containing potions currently in the stand from left to right

    bot._client.on('craft_progress_bar', onUpdateWindowProperty)
    brewingStand.once('close', () => {
      bot._client.removeListener('craft_progress_bar', onUpdateWindowProperty)
    })

    return brewingStand

    function onUpdateWindowProperty (packet) {
      if (packet.windowId !== brewingStand.id) return

      switch (packet.property) {
        case 0: // Current progress
          brewingStand.progress = packet.value
          brewingStand.progressSeconds = ticksToSeconds(packet.value)
          if (packet.value = 0) {
            brewingStand.emit('brewingFinished')
          }
          break
        case 1: // Current fuel
          brewingStand.fuel = packet.value
          break
      }

      brewingStand.emit('update')
    }

    async function takeSomething (item) {
      assert.ok(item)
      await bot.putAway(item.slot)
      return item
    }

    async function takeIngredient () {
      return takeSomething(brewingStand.ingredientItem())
    }

    async function takeFuel () {
      return takeSomething(brewingStand.fuelItem())
    }

    async function takePotion (slot) {
      return takeSomething(brewingStand.potions()[slot])
    }

    async function takePotions () {
      takeSomething(brewingStand.potions()[0])
      takeSomething(brewingStand.potions()[1])
      takeSomething(brewingStand.potions()[2])
    }

    async function putSomething (destSlot, itemType, metadata, count) {
      const options = {
        window: brewingStand,
        itemType,
        metadata,
        count,
        sourceStart: brewingStand.inventoryStart,
        sourceEnd: brewingStand.inventoryEnd,
        destStart: destSlot,
        destEnd: destSlot + 1
      }
      await bot.transfer(options)
    }

    async function putIngredient (itemType, metadata, count) {
      await putSomething(3, itemType, metadata, count)
    }

    async function putFuel (itemType, metadata, count) {
      await putSomething(4, itemType, metadata, count)
    }

    async function putPotion (slot, itemType, metadata, count) {
      if (![0, 1, 2].includes(slot)) {
        throw new Error(`Invalid slot ${slot}. Slot must be in [0, 1, 2].`)
      }
      //do we want to add a check here for whether or not the item we're trying to put in is a potion? furnace.putFuel doesn't have that check
      await putSomething(slot, itemType, metadata, count)
    }
  }

  function ticksToSeconds (ticks) {
    return ticks * 0.05
  }

  bot.openBrewingStand = openBrewingStand
}