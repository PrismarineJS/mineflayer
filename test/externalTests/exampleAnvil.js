const assert = require('assert')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)
  await bot.test.becomeCreative()
  /* setup */
  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.anvil.id, 1))
  await bot.test.becomeSurvival()
  await bot.test.placeBlock(36, bot.entity.position.offset(1, 0, 0))
  /* test one */
  await bot.test.becomeCreative()
  // get items
  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.diamond_sword.id, 1))
  await bot.test.setInventorySlot(37, makeBook([{ name: 'sharpness', lvl: 5 }]))

  if (mcData.isNewerOrEqualTo('1.13')) {
    bot.chat(`/xp set ${bot.username} 999 levels`)
  } else {
    bot.chat(`/xp 999L ${bot.username}`)
  }
  await bot.test.becomeSurvival()

  const b = bot.findBlock({ matching: mcData.blocksByName.anvil.id })
  const anvil = await bot.openAnvil(b)

  const sword = anvil.findInventoryItem(mcData.itemsByName.anvil.id)
  const book = anvil.findInventoryItem(mcData.itemsByName.anvil.id)

  anvil.combine(sword, book)
  console.log('Used anvil')

  function makeBook (enchs) {
    const book = new Item(mcData.itemsByName.enchanted_book.id, 1)
    book.enchants = enchs
    return book
  }
}
