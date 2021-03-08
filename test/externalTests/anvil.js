const assert = require('assert')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)
  await bot.test.becomeCreative()
  /* setup */
  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.anvil.id, 1))
  await bot.test.becomeSurvival()
  await bot.test.placeBlock(36, bot.entity.position.offset(1, 0, 0))

  if (mcData.isNewerOrEqualTo('1.13')) bot.chat(`/xp set ${bot.username} 999 levels`)
  else bot.chat(`/xp 999L ${bot.username}`)

  const b = bot.findBlock({ matching: mcData.blocksByName.anvil.id }) // find anvil before tests so all tests can use it
  /* test one */
  await testOne()
  /* test two */
  await testTwo()

  async function testOne () {
    await bot.test.becomeCreative()
    // get items
    await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.diamond_sword.id, 1))
    await bot.test.setInventorySlot(37, makeBook([{ name: 'sharpness', lvl: 5 }]))
    await bot.test.becomeSurvival()

    const anvil = await bot.openAnvil(b)

    const sword = anvil.findInventoryItem(mcData.itemsByName.diamond_sword.id)
    const book = anvil.findInventoryItem(mcData.itemsByName.enchanted_book.id)

    await anvil.combine(sword, book)
    await bot.test.wait(1000)
    // test result
    assert.strictEqual(bot.experience.level, 994)
    assert.strictEqual(bot.inventory.slots[9].repairCost, 1)
    assert.deepStrictEqual(bot.inventory.slots[9].enchants, [{ name: 'sharpness', lvl: 5 }])
  }
  async function testTwo () {
    bot.chat(`/clear ${bot.username}`)
    await bot.test.becomeCreative()

    await bot.test.setInventorySlot(36, makeItem({ type: mcData.itemsByName.diamond_sword.id, enchants: [{ name: 'sharpness', lvl: 5 }] }))
    await bot.test.setInventorySlot(37, new Item(mcData.itemsByName.diamond_sword.id, 1))
    await bot.test.setInventorySlot(38, makeBook([{ name: 'unbreaking', lvl: 3 }]))

    await bot.test.becomeSurvival()

    const anvil = await bot.openAnvil(b)

    const sword = bot.inventory.slots[37]
    const book = anvil.findInventoryItem(mcData.itemsByName.enchanted_book.id)

    await anvil.combine(sword, book)
    await bot.test.wait(1000)
    // test result
    assert.strictEqual(bot.experience.level, 991)
    assert.strictEqual(bot.inventory.slots[9].repairCost, 1)
    assert.deepStrictEqual(bot.inventory.slots[9].enchants, [{ name: 'sharpness', lvl: 5 }, { name: 'unbreaking', lvl: 3 }])
  }

  function makeBook (enchants) {
    return makeItem({ type: mcData.itemsByName.enchanted_book.id, count: 1, enchants })
  }

  function makeItem (opts) {
    const { type, count = 1, enchants, repairCost } = opts
    const item = new Item(type, count)
    item.enchants = enchants
    item.repairCost = repairCost
    return item
  }
}
