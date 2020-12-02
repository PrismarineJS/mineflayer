const Furnace = require('../furnace')
const assert = require('assert')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  function openFurnace (furnaceBlock) {
    assert.ok(furnaceBlock.name === 'furnace' || furnaceBlock.name === 'lit_furnace')
    const furnace = bot.openBlock(furnaceBlock, Furnace)
    furnace.takeInput = callbackify(takeInput)
    furnace.takeFuel = callbackify(takeFuel)
    furnace.takeOutput = callbackify(takeOutput)
    furnace.putInput = callbackify(putInput)
    furnace.putFuel = callbackify(putFuel)
    bot._client.on('craft_progress_bar', onUpdateWindowProperty)
    furnace.once('close', onClose)
    return furnace
    function onClose () {
      bot._client.removeListener('craft_progress_bar', onUpdateWindowProperty)
    }

    function onUpdateWindowProperty (packet) {
      if (!furnace.window) return
      if (packet.windowId !== furnace.window.id) return

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
        window: furnace.window,
        itemType,
        metadata,
        count,
        sourceStart: furnace.window.inventoryStart,
        sourceEnd: furnace.window.inventoryEnd,
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
