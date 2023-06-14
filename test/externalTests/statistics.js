const assert = require('assert')

module.exports = () => async (bot) => {
  await bot.test.wait(1000) // Make sure everything is updated?

  const stats = await bot.requestStatistics()

  console.log(stats)

  // Easiest Stat to Test, not dependent on any other tests
  assert(stats['minecraft.play_one_minute'] > 0)

  // Dependent On Other Tests - Free To Remove If Errors
  // Test: crafting
  assert(stats['minecraft.crafted.minecraft.ladder'] >= 1)

  // Test: digAndBuild
  assert(stats['minecraft.mined.minecraft.dirt'] >= 1)
  assert(stats['minecraft.used.minecraft.dirt'] >= 1)
}
