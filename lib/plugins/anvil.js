const assert = require('assert')
const { callbackify, sleep } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  const Item = require('prismarine-item')(bot.version)

  const matchWindowType = window => /minecraft:(?:chipped_|damaged_)?anvil/.test(window.type)

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
      for (let i = 1; i < name.length + 1; i++) {
        sendItemName(name.substring(0, i))
        await sleep(50)
      }
    }
    async function putInAnvil (itemOne, itemTwo) {
      await putSomething(0, itemOne.type, itemOne.metadata, itemOne.count)
      sendItemName('') // sent like this by vnailla
      if (!bot.supportFeature('useMCItemName')) sendItemName('')
      await putSomething(1, itemTwo.type, itemTwo.metadata, itemTwo.count)
    }

    async function combine (itemOne, itemTwo, name) {
      if (name?.length > 35) err('Name is too long.')
      if (bot.supportFeature('useMCItemName')) {
        bot._client.registerChannel('MC|ItemName', 'string')
      }

      assert.ok(itemOne && itemTwo)
      const { xpCost: normalCost } = Item.anvil(itemOne, itemTwo, bot.game.gameMode === 'creative', name)
      const { xpCost: inverseCost } = Item.anvil(itemTwo, itemOne, bot.game.gameMode === 'creative', name)
      if (normalCost === 0 && inverseCost === 0) err('Not anvil-able (in either direction), cancelling.')

      const smallest = (normalCost < inverseCost ? normalCost : inverseCost) === 0 ? inverseCost : 0
      if (bot.game.gameMode !== 'creative' && bot.experience.level < smallest) {
        err('Player does not have enough xp to do action, cancelling.')
      }

      if (normalCost === 0) await putInAnvil(itemTwo, itemOne)
      else if (inverseCost === 0) await putInAnvil(itemOne, itemTwo)
      else if (normalCost < inverseCost) await putInAnvil(itemOne, itemTwo)
      else await putInAnvil(itemTwo, itemOne)

      await addCustomName(name)

      await bot.putAway(2)
      anvil.close()
    }

    async function rename (item, name) {
      if (name?.length > 35) err('Name is too long.')
      if (bot.supportFeature('useMCItemName')) {
        bot._client.registerChannel('MC|ItemName', 'string')
      }

      assert.ok(item)
      const { xpCost: normalCost } = Item.anvil(item, null, bot.game.gameMode === 'creative', name)
      if (normalCost === 0) err('Not valid rename, cancelling.')

      if (bot.game.gameMode !== 'creative' && bot.experience.level < normalCost) {
        err('Player does not have enough xp to do action, cancelling.')
      }

      await putSomething(0, item.type, item.metadata, item.count)
      sendItemName('') // sent like this by vnailla
      if (!bot.supportFeature('useMCItemName')) sendItemName('')
      await addCustomName(name)
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
