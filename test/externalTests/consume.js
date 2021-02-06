const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)
  const mcData = require('minecraft-data')(bot.version)

  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.bread.id, 5, 0))

  // Cannot consume if bot.food === 20
  await assert.rejects(bot.consume, (err) => {
    assert.notStrictEqual(err, undefined)
    return true
  })

  await bot.test.becomeSurvival()

  while (bot.food > 0) {
    if (bot.supportFeature('effectAreNotPrefixed')) bot.test.sayEverywhere('/effect give @s hunger 1 255')
    else if (bot.supportFeature('effectAreMinecraftPrefixed')) bot.test.sayEverywhere(`/effect ${bot.username} minecraft:hunger 1 255`)
    await bot.test.wait(500)
  }

  while (bot.food < 20) {
    await bot.consume()
    await bot.test.wait(100)
  }
}
