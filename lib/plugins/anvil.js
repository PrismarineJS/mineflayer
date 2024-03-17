const assert = require('assert')
const { sleep } = require('../promise_utils')
const { once } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  const Item = require('prismarine-item')(bot.registry)

  const matchWindowType = window => /minecraft:(?:chipped_|damaged_)?anvil/.test(window.type)

  async function openAnvil (anvilBlock) {
    const anvil = await bot.openBlock(anvilBlock)
    if (!matchWindowType(anvil)) {
      throw new Error('Not a anvil-like window: ' + JSON.stringify(anvil))
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
      await putSomething(0, itemOne.type, itemOne.metadata, itemOne.count, itemOne.nbt)
      sendItemName('') // sent like this by vnailla
      if (!bot.supportFeature('useMCItemName')) sendItemName('')
      await putSomething(1, itemTwo.type, itemTwo.metadata, itemTwo.count, itemTwo.nbt)
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

      const xpPromise = bot.game.gameMode === 'creative' ? Promise.resolve() : once(bot, 'experience')
      if (normalCost === 0) await putInAnvil(itemTwo, itemOne)
      else if (inverseCost === 0) await putInAnvil(itemOne, itemTwo)
      else if (normalCost < inverseCost) await putInAnvil(itemOne, itemTwo)
      else await putInAnvil(itemTwo, itemOne)

      await addCustomName(name)
      await bot.putAway(2)
      await xpPromise
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
      const xpPromise = once(bot, 'experience')
      await putSomething(0, item.type, item.metadata, item.count, item.nbt)
      sendItemName('') // sent like this by vnailla
      if (!bot.supportFeature('useMCItemName')) sendItemName('')
      await addCustomName(name)
      await bot.putAway(2)
      await xpPromise
    }

    async function putSomething (destSlot, itemId, metadata, count, nbt) {
      const options = {
        window: anvil,
        itemType: itemId,
        metadata,
        count,
        nbt,
        sourceStart: anvil.inventoryStart,
        sourceEnd: anvil.inventoryEnd,
        destStart: destSlot,
        destEnd: destSlot + 1
      }
      await bot.transfer(options)
    }

    anvil.combine = combine
    anvil.rename = rename

    return anvil
  }

  bot.openAnvil = openAnvil
}
