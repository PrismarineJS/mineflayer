const assert = require('assert')
const { callbackify, sleep } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  const Item = require('prismarine-item')(bot.version)
  const allowedWindowTypes =
  [
    'minecraft:anvil'
    // 'minecraft:chipped_anvil',
    // 'minecraft:damaged_anvil'
  ]

  function matchWindowType (window) {
    for (const type of allowedWindowTypes) {
      if (window.type.startsWith(type)) return true
    }
    return false
  }

  async function openAnvil (anvilBlock) {
    const anvil = await bot.openBlock(anvilBlock)
    if (!matchWindowType(anvil)) {
      throw new Error('This is not a anvil-like window')
    }

    function err (name) {
      anvil.close()
      throw new Error(name)
    }

    function sendItemName (name) {
      if (bot.supportFeature('useMCItemName')) {
        bot._client.writeChannel('MC|ItemName', name)
      } else {
        bot._client.write('name_item', { name })
      }
    }

    async function addCustomName (name) {
      if (!name) return
      for (let i = 1; i < name.length; i++) {
        sendItemName(name.substring(0, i))
        await sleep(50)
      }
    }
    async function putInAnvil (itemOne, itemTwo, invsere) {
      if (!invsere) {
        await putSomething(0, itemOne.type, itemOne.metadata, itemOne.count)
        sendItemName('') // sent like this by vnailla
        if (!bot.supportFeature('useMCItemName')) sendItemName('')
        await putSomething(1, itemTwo.type, itemTwo.metadata, itemTwo.count)
      } else {
        await putSomething(0, itemTwo.type, itemTwo.metadata, itemTwo.count)
        sendItemName('') // sent like this by vnailla
        if (!bot.supportFeature('useMCItemName')) sendItemName('')
        await putSomething(1, itemOne.type, itemOne.metadata, itemOne.count)
      }
    }

    async function combine (slotOne, slotTwo, name) {
      if (name?.length > 35) err('Name is too long.')
      if (bot.supportFeature('useMCItemName')) {
        bot._client.registerChannel('MC|ItemName', 'string')
      }

      const itemOne = bot.inventory.slots[slotOne]
      const itemTwo = bot.inventory.slots[slotTwo]
      assert.ok(itemOne && itemTwo)
      const { xpCost: normal } = Item.anvil(itemOne, itemTwo, bot.game.gameMode === 'creative', name)
      const { xpCost: inverse } = Item.anvil(itemTwo, itemOne, bot.game.gameMode === 'creative', name)
      if (normal === 0 && inverse === 0) err('Not anvil-able (in either direction), cancelling.')

      const smallest = (normal < inverse ? normal : inverse) === 0 ? inverse : 0
      if (bot.game.gameMode !== 'creative' && bot.experience.level < smallest) {
        err('Player does not have enough xp to do action, cancelling.')
      }
      if (normal === 0) {
        await putInAnvil(itemOne, itemTwo, true)
      } else if (inverse === 0) {
        await putInAnvil(itemOne, itemTwo, false)
      } else if (normal < inverse) {
        await putInAnvil(itemOne, itemTwo, false)
      } else {
        await putInAnvil(itemOne, itemTwo, true)
      }
      await addCustomName(name)

      if (!bot.currentWindow.slots[2]) {
        console.log(bot.currentWindow.slots)
        await bot.putAway(0)
        await bot.putAway(1)
        err('There is nothing to take out of the anvil.')
      }

      await bot.putAway(2)
      anvil.close()
    }

    async function rename (slot, name) {
      if (name?.length > 35) err('Name is too long.')
      if (bot.supportFeature('useMCItemName')) {
        bot._client.registerChannel('MC|ItemName', 'string')
      }

      const itemOne = bot.inventory.slots[slot]
      assert.ok(itemOne)
      const { xpCost: normal } = Item.anvil(itemOne, null, bot.game.gameMode === 'creative', name)
      if (normal === 0) err('Not valid rename, cancelling.')

      if (bot.game.gameMode !== 'creative' && bot.experience.level < normal) {
        err('Player does not have enough xp to do action, cancelling.')
      }

      await putSomething(0, itemOne.type, itemOne.metadata, itemOne.count)
      sendItemName('') // sent like this by vnailla
      if (!bot.supportFeature('useMCItemName')) sendItemName('')
      await addCustomName(name)

      if (!bot.currentWindow.slots[2]) {
        await bot.putAway(0)
        err('There is nothing to take out of the anvil.')
      }
      await bot.putAway(2)
      anvil.close()
    }

    async function putSomething (destSlot, itemId, metadata, count) {
      const options = {
        window: anvil,
        itemType: itemId,
        metadata,
        count,
        sourceStart: anvil.inventoryStart,
        sourceEnd: anvil.inventoryEnd,
        destStart: destSlot,
        destEnd: destSlot + 1
      }
      await bot.transfer(options)
    }

    anvil.combine = callbackify(combine)
    anvil.rename = callbackify(rename)

    return anvil
  }

  bot.openAnvil = callbackify(openAnvil)
}
