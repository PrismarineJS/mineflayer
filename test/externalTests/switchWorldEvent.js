const { once, onceWithCleanup } = require('../../lib/promise_utils')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = () => async (bot) => {
  bot.chat('switchWorldEvent test')

  bot.on('switchWorld', () => {
    bot.chat('switchWorld event fired')
  })

  let switchWorldTriggered = false

  const switchWorldPromise = onceWithCleanup(bot, 'switchWorld', {
    timeout: 15000
  })
  const switchWorldListener = () => {
    switchWorldTriggered = true
  }
  
  bot.chat('/kill')
  await sleep(100)
  bot.chat('/kill')
  await sleep(100)

  bot.chat('/gamemode creative')
  bot.chat('/gamemode 1')

  await sleep(2000)
  bot.on('switchWorld', switchWorldListener)
  bot.chat('Killing now')
  bot.chat('/kill')
  await sleep(3000)
  bot.off('switchWorld', switchWorldListener)
  bot.chat('Kill switchWorld time over')

  if (switchWorldTriggered) {  
    bot.chat('switchWorld triggered after kill!')
    throw new Error('switchWorld event was triggered after kill, not after dimension switch!')
  }

  bot.chat('/gamemode creative')
  bot.chat('/gamemode 1')

  await sleep(5000)
  bot.chat('Going to nether now')
  bot.chat('/setblock ~ ~ ~ nether_portal')
  bot.chat('/setblock ~ ~ ~ portal')

  await switchWorldPromise

  bot.chat('Bot switched worlds, switchWorld event was properly emitted!')
}
