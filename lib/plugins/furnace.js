const Furnace = require('../furnace')
const assert = require('assert')

module.exports = inject

function inject (bot, { version }) {
  function openFurnace (furnaceBlock) {
    assert.ok(furnaceBlock.name === 'furnace' || furnaceBlock.name === 'lit_furnace')
    const furnace = bot.openBlock(furnaceBlock, Furnace)
    furnace.takeInput = takeInput
    furnace.takeFuel = takeFuel
    furnace.takeOutput = takeOutput
    furnace.putInput = putInput
    furnace.putFuel = putFuel
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

    function takeSomething (item, cb) {
      assert.ok(item)
      bot.putAway(item.slot, (err) => {
        if (err) {
          cb(err)
        } else {
          cb(null, item)
        }
      })
    }

    function takeInput (cb) {
      takeSomething(furnace.inputItem(), cb)
    }

    function takeFuel (cb) {
      takeSomething(furnace.fuelItem(), cb)
    }

    function takeOutput (cb) {
      takeSomething(furnace.outputItem(), cb)
    }

    function putSomething (destSlot, itemType, metadata, count, cb) {
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
      bot.transfer(options, cb)
    }

    function putInput (itemType, metadata, count, cb) {
      putSomething(0, itemType, metadata, count, cb)
    }

    function putFuel (itemType, metadata, count, cb) {
      putSomething(1, itemType, metadata, count, cb)
    }
  }

  function ticksToSeconds (ticks) {
    return ticks * 0.05
  }

  bot.openFurnace = openFurnace
}
