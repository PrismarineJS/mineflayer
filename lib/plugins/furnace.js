const assert = require('assert')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:furnace', 'minecraft:blast_furnace', 'minecraft:smoker']

  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openFurnace (furnaceBlock) {
    const furnace = await bot.openBlock(furnaceBlock)
    if (!matchWindowType(furnace)) {
      throw new Error('This is not a furnace-like window')
    }

    furnace.totalFuel = null
    furnace.fuel = null
    furnace.fuelSeconds = null
    furnace.totalProgress = null
    furnace.progress = null
    furnace.progressSeconds = null
    furnace.takeInput = takeInput
    furnace.takeFuel = takeFuel
    furnace.takeOutput = takeOutput
    furnace.putInput = putInput
    furnace.putFuel = putFuel
    furnace.inputItem = function () { return this.slots[0] }
    furnace.fuelItem = function () { return this.slots[1] }
    furnace.outputItem = function () { return this.slots[2] }

    bot._client.on('craft_progress_bar', onUpdateWindowProperty)
    furnace.once('close', () => {
      bot._client.removeListener('craft_progress_bar', onUpdateWindowProperty)
    })

    return furnace

    function onUpdateWindowProperty (packet) {
      if (packet.windowId !== furnace.id) return

      switch (packet.property) {
        case 0: // Current fuel
          furnace.fuel = 0
          furnace.fuelSeconds = 0
          if (furnace.totalFuel) {
            furnace.fuel = packet.value / furnace.totalFuel
            furnace.fuelSeconds = furnace.fuel * furnace.totalFuelSeconds
          }
          break
        case 1: // Total fuel
          furnace.totalFuel = packet.value
          furnace.totalFuelSeconds = ticksToSeconds(furnace.totalFuel)
          break
        case 2: // Current progress
          furnace.progress = 0
          furnace.progressSeconds = 0
          if (furnace.totalProgress) {
            furnace.progress = packet.value / furnace.totalProgress
            furnace.progressSeconds = furnace.totalProgressSeconds - (furnace.progress * furnace.totalProgressSeconds)
          }
          break
        case 3: // Total progress
          furnace.totalProgress = packet.value
          furnace.totalProgressSeconds = ticksToSeconds(furnace.totalProgress)
      }

      furnace.emit('update')
    }

    async function takeSomething (item) {
      assert.ok(item)
      await bot.putAway(item.slot)
      return item
    }

    async function takeInput () {
      return takeSomething(furnace.inputItem())
    }

    async function takeFuel () {
      return takeSomething(furnace.fuelItem())
    }

    async function takeOutput () {
      return takeSomething(furnace.outputItem())
    }

    async function putSomething (destSlot, itemType, metadata, count) {
      const options = {
        window: furnace,
        itemType,
        metadata,
        count,
        sourceStart: furnace.inventoryStart,
        sourceEnd: furnace.inventoryEnd,
        destStart: destSlot,
        destEnd: destSlot + 1
      }
      await bot.transfer(options)
    }

    async function putInput (itemType, metadata, count) {
      await putSomething(0, itemType, metadata, count)
    }

    async function putFuel (itemType, metadata, count) {
      await putSomething(1, itemType, metadata, count)
    }
  }

  function ticksToSeconds (ticks) {
    return ticks * 0.05
  }

  bot.openFurnace = openFurnace
}
