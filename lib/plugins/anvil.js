const assert = require('assert')
const { once } = require('events')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  const allowedWindowTypes = ['minecraft:anvil', 'minecraft:chipped_anvil', 'minecraft:damaged_anvil']

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

    async function useAnvil (firstItemId, secondItemId, name) {
      // set name, if it's undefined it's not used
      if (name) bot._client.write('name_item', { name })
      // check Left To Right
      const firstItemLeft = bot.inventory.slots[firstItemId]
      const secondItemRight = bot.inventory.slots[secondItemId]
      // only proceed if both items aren't null
      assert.ok(firstItemLeft)
      assert.ok(secondItemRight)
      await putSomething(0, firstItemLeft.type, firstItemLeft.metadata, firstItemLeft.count)
      // don't await this or else you miss the craft_progres_bar
      putSomething(1, secondItemRight.type, secondItemRight.metadata, secondItemRight.count)
      const [{ value: enchantCostLeftToRight }] = await once(bot._client, 'craft_progress_bar')
      // put back items
      await bot.putAway(0)
      await bot.putAway(1)
      // check Right to Left
      const firstItemRight = bot.inventory.slots[firstItemId]
      const secondItemLeft = bot.inventory.slots[secondItemId]
      await putSomething(0, firstItemRight.type, firstItemRight.metadata, firstItemRight.count)
      // don't await this or else you miss the craft_progres_bar
      putSomething(1, secondItemLeft.type, secondItemLeft.metadata, secondItemLeft.count)
      const [{ value: enchantCostRightToLeft }] = await once(bot._client, 'craft_progress_bar')
      // if the cost is 0, you can't do the action
      if (enchantCostLeftToRight > enchantCostRightToLeft && enchantCostLeftToRight > 0) {
        // put items back to get left to right order, because it was cheaper xp wise
        if (bot.game.gameMode !== 'creative' && bot.experience.level < enchantCostRightToLeft) {
          await bot.putAway(0)
          await bot.putAway(1)
          throw new Error('Player does not have enough xp to do action, cancelling.')
        }
        // swap order in anvil
        await bot.clickWindow(0, 0, 0)
        await bot.clickWindow(1, 0, 0)
        await bot.clickWindow(0, 0, 0)
        await bot.putAway(2)
      } else if (enchantCostRightToLeft > 0) {
        if (bot.game.gameMode !== 'creative' && bot.experience.level < enchantCostLeftToRight) {
          await bot.putAway(0)
          await bot.putAway(1)
          throw new Error('Player does not have enough xp to do action, cancelling.')
        }
        await bot.putAway(2)
      } else {
        // retrieve materials
        await bot.putAway(0)
        await bot.putAway(1)
        throw new Error('Not anvil-able (in either direction), cancelling.')
      }
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

    anvil.useAnvil = callbackify(useAnvil)
    anvil.firstInput = () => anvil.slots[0]
    anvil.secondInput = () => anvil.slots[1]
    anvil.output = () => anvil.slots[2]

    return anvil
  }

  bot.openAnvil = callbackify(openAnvil)
}
