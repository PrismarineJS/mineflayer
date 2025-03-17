const { once, onceWithCleanup } = require('../../lib/promise_utils')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = () => async (bot) => {
  await once(bot, 'spawn')

  const switchWorldPromise = onceWithCleanup(bot, 'switchWorld', {
    timeout: 15000
  })

  let switchWorldTriggered = false
  
  const switchWorldListener = () => {
    switchWorldTriggered = true
  }

  bot.on('switchWorld', switchWorldListener)

  bot.test.sayEverywhere('/kill')
  
  await sleep(3000)

  bot.off('switchWorld', switchWorldListener)

  if (switchWorldTriggered) {
    throw new Error('switchWorld event was triggered after kill, not after dimension switch!')
  }

  bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
  bot.test.sayEverywhere('/setblock ~ ~ ~ portal')

  await switchWorldPromise

  console.log('Bot switched worlds, switchWorld event was emitted!')
}
