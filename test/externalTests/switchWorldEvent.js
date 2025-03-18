const { once, onceWithCleanup } = require('../../lib/promise_utils')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = () => async (bot) => {
  await once(bot, 'spawn')

  bot.on('switchWorld', () => {
    bot.test.sayEverywhere('switchWorld event fired')
  })

  let switchWorldTriggered = false

  const switchWorldPromise = onceWithCleanup(bot, 'switchWorld', {
    timeout: 15000
  })
  const switchWorldListener = () => {
    switchWorldTriggered = true
  }
  bot.test.sayEverywhere('/gamemode creative')
  bot.test.sayEverywhere('/gamemode 1')

  await sleep(500)
  bot.on('switchWorld', switchWorldListener)
  bot.test.sayEverywhere('Killing now')
  bot.test.sayEverywhere('/kill')
  await sleep(3000)
  bot.off('switchWorld', switchWorldListener)
  bot.test.sayEverywhere('Kill switchWorld time over')

  if (switchWorldTriggered) {
    throw new Error('switchWorld event was triggered after kill, not after dimension switch!')
  }

  await sleep(1000)
  bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')

  await switchWorldPromise

  bot.test.sayEverywhere('Bot switched worlds, switchWorld event was properly emitted!')
}
