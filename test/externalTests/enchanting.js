const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)

  const lapisId = bot.registry.itemsByName.lapis_lazuli ? bot.registry.itemsByName.lapis_lazuli.id : bot.registry.itemsByName.dye.id
  const lapisData = bot.registry.itemsByName.lapis_lazuli ? 0 : 4

  const enchantSlot = 2

  if (bot.registry.isNewerOrEqualTo('1.13')) {
    bot.chat(`/xp set ${bot.username} 999 levels`)
  } else {
    bot.chat(`/xp 999L ${bot.username}`)
  }
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bookshelf.id, 15))
  await bot.test.setInventorySlot(37, new Item(bot.registry.itemsByName.enchanting_table.id, 1))
  await bot.test.setInventorySlot(38, new Item(bot.registry.itemsByName.diamond_sword.id, 1))
  await bot.test.setInventorySlot(39, new Item(lapisId, enchantSlot + 1, lapisData))

  await bot.test.becomeSurvival()

  // Place enchanting table
  await bot.test.placeBlock(37, bot.entity.position.offset(1, 0, 0))

  // Place bookshelfs
  await bot.test.placeBlock(36, bot.entity.position.offset(3, 0, 2))
  await bot.test.placeBlock(36, bot.entity.position.offset(3, 0, 1))
  await bot.test.placeBlock(36, bot.entity.position.offset(3, 0, 0))
  await bot.test.placeBlock(36, bot.entity.position.offset(3, 0, -1))
  await bot.test.placeBlock(36, bot.entity.position.offset(3, 0, -2))
  await bot.test.placeBlock(36, bot.entity.position.offset(2, 0, -2))
  await bot.test.placeBlock(36, bot.entity.position.offset(1, 0, -2))
  await bot.test.placeBlock(36, bot.entity.position.offset(0, 0, -2))
  await bot.test.placeBlock(36, bot.entity.position.offset(-1, 0, -2))
  await bot.test.placeBlock(36, bot.entity.position.offset(-1, 0, -1))
  await bot.test.placeBlock(36, bot.entity.position.offset(-1, 0, 1))
  await bot.test.placeBlock(36, bot.entity.position.offset(-1, 0, 2))
  await bot.test.placeBlock(36, bot.entity.position.offset(0, 0, 2))
  await bot.test.placeBlock(36, bot.entity.position.offset(1, 0, 2))
  await bot.test.placeBlock(36, bot.entity.position.offset(2, 0, 2))

  const b = bot.findBlock({ matching: bot.registry.blocksByName.enchanting_table.id })
  const enchantingTable = await bot.openEnchantmentTable(b)

  console.log('Opened enchanting table')

  const lapis = enchantingTable.findInventoryItem(lapisId)
  await enchantingTable.putLapis(lapis)

  const sword = enchantingTable.findInventoryItem(bot.registry.itemsByName.diamond_sword.id)

  await enchantingTable.putTargetItem(sword)

  console.log('Table ready')
  await enchantingTable.enchant(enchantSlot)
  const result = await enchantingTable.takeTargetItem()

  assert.notStrictEqual(result.nbt, undefined)

  enchantingTable.close()
}
