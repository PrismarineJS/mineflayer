const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)

  // Initial state
  const initialState = {
    level: bot.experience.level,
    points: bot.experience.points,
    progress: bot.experience.progress
  }
  assert(initialState.level >= 0, 'Initial experience level should be non-negative')
  assert(initialState.points >= 0, 'Initial experience points should be non-negative')
  assert(initialState.progress >= 0 && initialState.progress <= 1, 'Initial experience progress should be between 0 and 1')

  // Test experience points
  const xpCommand = bot.registry.isOlderThan('1.13')
    ? `/xp 10 ${bot.username}`
    : `/xp add ${bot.username} 10 points`

  await bot.chat(xpCommand)
  await once(bot, 'experience')

  // Verify after points
  assert(bot.experience.points >= 10, 'Experience points should be at least 10 after adding points')
  assert(bot.experience.level >= initialState.level, 'Experience level should not decrease after adding points')
  assert(bot.experience.progress >= 0 && bot.experience.progress <= 1, 'Experience progress should be between 0 and 1 after adding points')

  // Test experience levels
  const levelCommand = bot.registry.isOlderThan('1.13')
    ? `/xp 100L ${bot.username}`
    : `/xp add ${bot.username} 100 levels`

  await bot.chat(levelCommand)
  await once(bot, 'experience')

  // Verify after levels
  assert(bot.experience.level >= 100, 'Experience level should be at least 100 after adding levels')
  assert(bot.experience.points > 0, 'Experience points should be positive after adding levels')
  assert(bot.experience.progress >= 0 && bot.experience.progress <= 1, 'Experience progress should be between 0 and 1 after adding levels')
}
