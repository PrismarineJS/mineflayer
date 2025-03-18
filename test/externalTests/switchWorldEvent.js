const { once, onceWithCleanup } = require('../../lib/promise_utils')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = () => async (bot) => {
  await once(bot, 'spawn')

  bot.on('switchWorld', () => {
    console.log('switchWorld')
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
  bot.test.becomeCreative()

  await sleep(500)
  bot.on('switchWorld', switchWorldListener)
  console.log('Killing now')
  bot.test.sayEverywhere('/kill')
  bot.test.selfKill()
  await sleep(3000)
  bot.off('switchWorld', switchWorldListener)
  console.log('Kill switchWorld time over')

  if (switchWorldTriggered) {
    throw new Error('switchWorld event was triggered after kill, not after dimension switch!')
  }

  await sleep(1000)
  bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')

  await switchWorldPromise

  console.log('Bot switched worlds, switchWorld event was properly emitted!')
}
