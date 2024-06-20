const assert = require('assert')
const { onceWithCleanup } = require('../promise_utils')

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
    const brewingStandPromise = bot.openBlock(brewingStandBlock)
    let fuelPacket

    if (bot.registry.isNewerOrEqualTo('1.9')) { // this packet doesn't come if the brewing stand has no fuel on versions 1.14-1.16
      try {
        [fuelPacket] = await onceWithCleanup(bot._client, 'craft_progress_bar', { timeout: 2500, checkCondition: (packet) => (packet.property === 1) })
      } catch (err) {
        if (!bot.registry.isNewerOrEqualTo('1.14') || bot.registry.isNewerOrEqualTo('1.17')) {
          throw err
        } else {
          fuelPacket = { value: 0 }
        }
      }
    }
    const brewingStand = await brewingStandPromise

    if (!matchWindowType(brewingStand)) {
      throw new Error('This is not a brewing-stand-like window')
    }

    brewingStand.fuel = fuelPacket?.value || null
    brewingStand.progress = 0
    brewingStand.progressSeconds = 0
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
          if (packet.value === 0) {
            brewingStand.emit('brewingStopped') // currently fires whenever the brewing stand finishes brewing or when it's stopped by removing an ingredient. how can we make an event that fires only when the brewing is finished? triggered by the sound, perhaps?
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
      for (const i of [0, 1, 2]) {
        if (brewingStand.potions()[i]) await takeSomething(brewingStand.potions()[i])
      }
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
      // do we want to add a check here for whether or not the item we're trying to put in is a potion? furnace.putFuel doesn't have that check, but it might be useful
      await putSomething(slot, itemType, metadata, count)
    }
  }

  function ticksToSeconds (ticks) {
    return ticks * 0.05
  }

  bot.openBrewingStand = openBrewingStand
}
