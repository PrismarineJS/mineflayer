const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)
  const mcData = require('minecraft-data')(bot.version)

  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.bread.id, 5, 0))
  await bot.test.becomeSurvival()
  // Cannot consume if bot.food === 20
  await assert.rejects(bot.consume, (err) => {
    if (!err) {
      // log the conditions that made this not throw
      console.log({ a: bot.game.gameMode !== 'creative', b: !['potion', 'milk_bucket', 'enchanted_golden_apple', 'golden_apple'].includes(bot.heldItem.name), c: bot.food === 20 })
    }
    assert.notStrictEqual(err, undefined)
    return true
  })

  await bot.test.becomeSurvival()

  while (bot.food > 0) {
    if (bot.supportFeature('effectAreNotPrefixed')) bot.test.sayEverywhere('/effect give @s hunger 1 255')
    else if (bot.supportFeature('effectAreMinecraftPrefixed')) bot.test.sayEverywhere(`/effect ${bot.username} minecraft:hunger 1 255`)
    await bot.test.wait(500)
  }

  assert.ok(!bot.usingHeldItem)
  while (bot.food < 20) {
    const consume = bot.consume()
    assert.ok(bot.usingHeldItem)
    await consume
    assert.ok(!bot.usingHeldItem)
    await bot.test.wait(100)
  }
}
