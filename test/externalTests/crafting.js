const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)
  const { blocksByName, findItemOrBlockByName } = require('minecraft-data')(bot.version)

  const craftingTableId = blocksByName.crafting_table.id
  const goldIngotId = findItemOrBlockByName('gold_ingot').id
  const goldBlockId = findItemOrBlockByName('gold_block').id

  // Place the crafting table
  const craftingTablePosition = bot.entity.position.offset(2, 0, 0).floored()
  bot.chat(`/setblock ${craftingTablePosition.toArray().join(' ')} crafting_table`)
  await once(bot, `blockUpdate:${craftingTablePosition}`) // bot.test.wait(500)
  const craftingTable = bot.blockAt(craftingTablePosition)
  assert.strictEqual(craftingTable.type, craftingTableId, 'The crafting table was not placed correctly')

  await bot.test.setInventorySlot(36, new Item(goldIngotId, 64, null, null))

  const goldBlocksRecipe = bot.recipesAll(goldBlockId, null, craftingTable)[0]
  const craftCount = Math.floor(bot.inventory.count(goldIngotId) / 9)

  console.log(`Crafting ${craftCount} golden blocks`)
  await bot.craft(goldBlocksRecipe, craftCount, craftingTable)

  assert.strictEqual(bot.inventory.count(goldBlockId), craftCount, 'It did not craft the correct amount')
}
