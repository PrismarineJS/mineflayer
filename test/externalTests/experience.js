const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  console.log('[experience test] Bot username:', bot.username)
  console.log('[experience test] Switching to survival mode...')
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)
  console.log('[experience test] In survival mode.')

  // Verify bot is in survival mode (accept both 0 and 'survival')
  console.log('[experience test] Actual game mode value:', bot.game.gameMode)
  assert(bot.game.gameMode === 0 || bot.game.gameMode === 'survival', 'Bot should be in survival mode')
  console.log('[experience test] Passed survival mode check.')

  // Log initial experience state
  console.log('[experience test] Initial experience state:', {
    level: bot.experience.level,
    points: bot.experience.points,
    progress: bot.experience.progress
  })

  // Add experience event listener for debugging
  const expListener = () => {
    console.log('[experience test] Experience event fired! New state:', {
      level: bot.experience.level,
      points: bot.experience.points,
      progress: bot.experience.progress
    })
  }
  bot.on('experience', expListener)

  // Add packet listener for debugging
  bot._client.on('experience', (packet) => {
    console.log('[experience test] Experience packet received:', packet)
  })

  // Give experience and wait for the event
  let xpCommand
  if (bot.registry.isOlderThan('1.13')) {
    xpCommand = `/xp 10 ${bot.username}`
  } else {
    xpCommand = `/xp add ${bot.username} 10 points`
  }
  console.log('[experience test] Running command:', xpCommand)
  const xpPromise = once(bot, 'experience')
  bot.chat(xpCommand)
  console.log('[experience test] Command executed, waiting for experience event...')
  console.log('[experience test] Waiting for experience event after xp 10...')
  await xpPromise
  console.log('[experience test] Experience event received after xp 10')

  // Verify experience properties
  console.log('[experience test] Current experience state:', {
    level: bot.experience.level,
    points: bot.experience.points,
    progress: bot.experience.progress
  })
  assert(bot.experience.level >= 0, 'Experience level should be non-negative')
  assert(bot.experience.points >= 0, 'Experience points should be non-negative')
  assert(bot.experience.progress >= 0 && bot.experience.progress <= 1, 'Experience progress should be between 0 and 1')

  // Give more experience to level up
  console.log('[experience test] Running level up command...')
  let levelUpCommand
  if (bot.registry.isOlderThan('1.13')) {
    levelUpCommand = `/xp 100L ${bot.username}`
  } else {
    levelUpCommand = `/xp add ${bot.username} 100 levels`
  }
  const levelUpPromise = once(bot, 'experience')
  bot.chat(levelUpCommand)
  console.log('[experience test] Waiting for experience event after level up...')
  await levelUpPromise
  console.log('[experience test] Experience event received after level up')

  // Verify final experience state
  console.log('[experience test] Final experience state:', {
    level: bot.experience.level,
    points: bot.experience.points,
    progress: bot.experience.progress
  })
  assert(bot.experience.level > 0, 'Experience level should be greater than 0 after level up')
  assert(bot.experience.points > 0, 'Experience points should be greater than 0 after level up')

  // Remove the experience event listener
  bot.removeListener('experience', expListener)

  console.log('[experience test] All checks passed!')
}
