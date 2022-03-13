const { once } = require('events')
const { Vec3 } = require('vec3')

module.exports = () => async (bot) => {
  const { blocksByName, itemsByName } = bot.registry
  const Item = require('prismarine-item')(bot.version)

  let populateBlockInventory
  let craftItem
  if (bot.supportFeature('oneBlockForSeveralVariations')) {
    populateBlockInventory = blocksByName.log
    craftItem = 'planks'
  } else if (bot.supportFeature('blockSchemeIsFlat')) {
    populateBlockInventory = itemsByName.birch_log
    craftItem = 'birch_planks'
  }

  function findCraftingTable () {
    const cursor = new Vec3(0, 0, 0)
    for (cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
      for (cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
        for (cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
          const block = bot.blockAt(cursor)
          if (block.type === blocksByName.crafting_table.id) return block
        }
      }
    }
  }

  async function craft (amount, name) {
    const item = itemsByName[name]
    const craftingTable = findCraftingTable()
    const wbText = craftingTable ? 'with a crafting table, ' : 'without a crafting table, '
    if (item == null) {
      bot.test.sayEverywhere(`${wbText}unknown item: ${name}`)
      throw new Error(`${wbText}unknown item: ${name}`)
    } else {
      const recipes = bot.recipesFor(item.id, null, 1, craftingTable) // doesn't check if it's possible to do it amount times
      if (recipes.length) {
        bot.test.sayEverywhere(`${wbText}I can make ${item.name}`)
        await bot.craft(recipes[0], amount, craftingTable)
        bot.test.sayEverywhere(`did the recipe for ${item.name} ${amount} times`)
      } else {
        bot.test.sayEverywhere(`${wbText}I can't make ${item.name}`)
        throw new Error(`${wbText}I can't make ${item.name}`)
      }
    }
  }

  await bot.test.setInventorySlot(36, new Item(populateBlockInventory.id, 1, 0))
  await bot.test.becomeSurvival()
  await craft(1, craftItem)
  await bot.test.setBlock({ x: 1, y: 0, z: 0, relative: true, blockName: 'crafting_table' })
  bot.chat('/give @p stick 7')
  await once(bot.inventory, 'updateSlot')
  const craftingTable = bot.findBlock({ matching: blocksByName.crafting_table.id })
  await bot.craft(bot.recipesFor(itemsByName.ladder.id, null, null, true)[0], 1, craftingTable)
}
