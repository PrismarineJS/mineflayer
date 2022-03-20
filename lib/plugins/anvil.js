const assert = require('assert')
const { sleep } = require('../promise_utils')
const { once } = require('events')

module.exports = inject

function inject (bot) {
  const Item = require('prismarine-item')(bot.version)

  const matchWindowType = window => /minecraft:(?:chipped_|damaged_)?anvil/.test(window.type)

  async function openAnvil (anvilBlock) {
    const anvil = await bot.openBlock(anvilBlock)
    if (!matchWindowType(anvil)) throw new Error('This is not a anvil-like window')

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
      // FIXME: If name === ''
      if (!name) return
      let oldName = 'Diamond Sword'

      while (oldName.length > 0) { // 'Diamond Swor' -> ''
        oldName = oldName.substring(0, oldName.length - 1)
        sendItemName(oldName)
        await sleep(50)
      }

      for (let i = 1; i < name.length + 1; i++) {
        sendItemName(name.substring(0, i))
        await sleep(50)
      }
    }

    async function putInAnvil (itemOne, itemTwo, expectedNewItem) {
      // sendItemName should be called after the item is picked up but before it is put in the new slot
      await bot.clickWindow(itemOne.slot, 0, 0)
      sendItemName('') // sent like this by vanilla
      if (!bot.supportFeature('useMCItemName')) sendItemName('')
      await bot.clickWindow(0, 0, 0)
      await sleep(500)
      if (itemTwo !== null) {
        await bot.clickWindow(itemTwo.slot, 0, 0)
        await sleep(500)
        await bot.clickWindow(1, 0, 0, { expectedNewItem, updateAnvilManually: true })
        await sleep(500)
      }
    }

    async function combine (itemOne, itemTwo, name) {
      if (name?.length > 35) err('Name is too long.')
      if (bot.supportFeature('useMCItemName')) {
        bot._client.registerChannel('MC|ItemName', 'string')
      }

      assert.ok(itemOne && itemTwo)
      const { xpCost: normalCost, item: normalItem } = Item.anvil(itemOne, itemTwo, bot.game.gameMode === 'creative', name)
      const { xpCost: inverseCost, item: inverseItem } = Item.anvil(itemTwo, itemOne, bot.game.gameMode === 'creative', name)
      if (normalCost === 0 && inverseCost === 0) err('Not anvil-able (in either direction), cancelling.')

      const smallest = (normalCost < inverseCost ? normalCost : inverseCost) === 0 ? inverseCost : 0
      if (bot.game.gameMode !== 'creative' && bot.experience.level < smallest) {
        err('Player does not have enough xp to do action, cancelling.')
      }

      const xpPromise = bot.game.gameMode === 'creative' ? Promise.resolve() : once(bot, 'experience')
      bot._client.on('craft_progress_bar', (data, meta) => {
        console.log(meta.name, data)
      })
      // const craftProgressBarPromise = once(bot._client, 'craft_progress_bar')
      let anviledInNormalOrder, expectedNewItem
      console.log('a')
      if (normalCost === 0) {
        anviledInNormalOrder = false
        expectedNewItem = anviledInNormalOrder ? normalItem : inverseItem
        await putInAnvil(itemTwo, itemOne, expectedNewItem)
      } else if (inverseCost === 0) {
        anviledInNormalOrder = true
        expectedNewItem = anviledInNormalOrder ? normalItem : inverseItem
        await putInAnvil(itemOne, itemTwo, expectedNewItem)
      } else if (normalCost < inverseCost) {
        anviledInNormalOrder = true
        expectedNewItem = anviledInNormalOrder ? normalItem : inverseItem
        await putInAnvil(itemOne, itemTwo, expectedNewItem)
      } else {
        anviledInNormalOrder = false
        expectedNewItem = anviledInNormalOrder ? normalItem : inverseItem
        await putInAnvil(itemTwo, itemOne, expectedNewItem)
      }
      console.log('b')
      await addCustomName(name) // maybe we do this letter by letter?
      console.log('c')
      // have to handle having no room in inventory
      // await craftProgressBarPromise // sent once we put both items in the anvil
      console.log('d')
      // const secondCPBPromise = once(bot._client, 'craft_progress_bar')
      await bot.clickWindow(2, 0, 0, { expectedNewItem, updateAnvilManually: true })
      await sleep(500)
      console.log('e')
      // await secondCPBPromise
      console.log('f')
      await bot.clickWindow(3, 0, 0)
      console.log('g')
      await xpPromise
    }

    async function rename (item, name) {
      if (name?.length > 35) err('Name is too long.')
      if (bot.supportFeature('useMCItemName')) {
        bot._client.registerChannel('MC|ItemName', 'string')
      }
      assert.ok(item)
      const { xpCost: normalCost, item: expectedNewItem } = Item.anvil(item, null, bot.game.gameMode === 'creative', name)
      if (normalCost === 0) err('Not valid rename, cancelling.')

      if (bot.game.gameMode !== 'creative' && bot.experience.level < normalCost) {
        err('Player does not have enough xp to do action, cancelling.')
      }
      const xpPromise = once(bot, 'experience')
      await putInAnvil(item, null, null)
      await addCustomName(name)
      // const secondCPBPromise = once(bot._client, 'craft_progress_bar')
      await bot.clickWindow(2, 0, 0, { expectedNewItem, updateAnvilManually: true })
      // await secondCPBPromise
      await bot.clickWindow(3, 0, 0)
      await xpPromise
    }

    anvil.combine = combine
    anvil.rename = rename

    return anvil
  }

  bot.openAnvil = openAnvil
}
