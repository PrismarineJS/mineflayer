const assert = require('assert')

module.exports = () => async (bot) => {
  // Test that activateItem works and has observable effects on the world
  // This reproduces the issue where activateItem fails on 1.21+ due to packet format changes

  const Item = require('prismarine-item')(bot.registry)

  // Set up conditions for testing item activation
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 5, 0))
  await bot.test.becomeSurvival()

  // Reduce food level so bread can be consumed
  while (bot.food > 10) {
    if (bot.supportFeature('effectAreNotPrefixed')) bot.test.sayEverywhere('/effect give @s hunger 1 255')
    else if (bot.supportFeature('effectAreMinecraftPrefixed')) bot.test.sayEverywhere(`/effect ${bot.username} minecraft:hunger 1 255`)
    await bot.test.wait(500)
  }

  const initialFood = bot.food
  const initialItemCount = bot.heldItem.count

  // Test that activateItem works and has observable server-side effects
  assert.ok(!bot.usingHeldItem, 'Should not be using item initially')

  // Use activateItem instead of consume to test the packet format
  bot.activateItem()
  assert.ok(bot.usingHeldItem, 'Should be using item after activateItem')

  // Wait for the server to process the action and observe effects
  await bot.test.wait(2000)

  // Verify the server processed the item use by checking observable changes
  const finalFood = bot.food
  const finalItemCount = bot.heldItem ? bot.heldItem.count : 0

  // The server should have processed the bread consumption
  assert.ok(finalFood > initialFood || finalItemCount < initialItemCount,
    'Server should have processed item activation (food increased or item consumed)')

  assert.ok(!bot.usingHeldItem, 'Should not be using item after server processes it')
}
