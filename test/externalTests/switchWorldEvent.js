const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  await once(bot, 'spawn')

  const switchWorldPromise = onceWithCleanup(bot, 'switchWorld', {
    timeout: 15000
  })

  bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')

  await switchWorldPromise

  console.log('Bot switched worlds, switchWorld event was emitted!')
}
