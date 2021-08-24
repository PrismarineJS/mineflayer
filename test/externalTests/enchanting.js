const assert = require('assert')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  const lapisId = mcData.itemsByName.lapis_lazuli ? mcData.itemsByName.lapis_lazuli.id : mcData.itemsByName.dye.id
  const lapisData = mcData.itemsByName.lapis_lazuli ? 0 : 4

  const enchantSlot = 2

  if (mcData.isNewerOrEqualTo('1.13')) {
    bot.chat(`/xp set ${bot.username} 999 levels`)
  } else {
    bot.chat(`/xp 999L ${bot.username}`)
  }
  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.bookshelf.id, 15))
  await bot.test.setInventorySlot(37, new Item(mcData.itemsByName.enchanting_table.id, 1))
  await bot.test.setInventorySlot(38, new Item(mcData.itemsByName.diamond_sword.id, 1))
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

  const b = bot.findBlock({ matching: mcData.blocksByName.enchanting_table.id })
  const enchantingTable = await bot.openEnchantmentTable(b)

  console.log('Opened enchanting table')

  const lapis = enchantingTable.findInventoryItem(lapisId)
  await enchantingTable.putLapis(lapis)

  const sword = enchantingTable.findInventoryItem(mcData.itemsByName.diamond_sword.id)

  await enchantingTable.putTargetItem(sword)

  console.log('Table ready')
  await enchantingTable.enchant(enchantSlot)
  const result = await enchantingTable.takeTargetItem()

  assert.notStrictEqual(result.nbt, undefined)

  enchantingTable.close()
}
