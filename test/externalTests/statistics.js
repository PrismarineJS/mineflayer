const assert = require('assert')

module.exports = () => async (bot) => {
  bot.chat('/kill')

  const stats = await bot.requestStatistics()

  console.log(stats)

  // Easiest Stats to Test, not dependent on any other tests
  assert(stats['stat.deaths'] > 0)
  assert(stats['stat.timeSinceDeath'] === 0)
  assert(stats['stat.playOneMinute'] > 0)

  // Stats that are dependent on previous tests
  // assert(stats['stat.craftingTableInteraction'] === 1)
  // assert(stats['stat.craftItem.minecraft.ladder'] === 3)
  // assert(stats['stat.craftItem.minecraft.planks'] === 4)
  // assert(stats['stat.itemEnchanted'] === 1)
  // assert(stats['stat.jump'] === 1)
  // assert(stats['stat.mineBlock.minecraft.dirt'] === 1)
  // assert(stats['stat.pickup.minecraft.dirt'] === 1)
  // assert(stats['stat.sleepInBed'] === 1)
  // assert(stats['stat.useItem.minecraft.bookshelf'] === 15)
  // assert(stats['stat.useItem.minecraft.bread'] === 4)
  // assert(stats['stat.useItem.minecraft.dirt'] === 1)
  // assert(stats['stat.useItem.minecraft.enchanting_table'] === 1)
}
