/*
 *
 * A simple bot that requests statistics.
 *
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node statistics.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'stats',
  password: process.argv[5],
  verbose: true
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'loaded':
      await bot.waitForChunksToLoad()
      bot.chat('Ready!')
      break
    case 'test': {
      // Jump Statistic
      bot.setControlState('jump', true)
      await bot.waitForTicks(1)
      bot.setControlState('jump', false)

      // Death Statistic
      bot.chat('/kill')

      const statistics = await bot.requestStatistics()
      bot.chat(`deaths=${statistics['stat.deaths']};timeLastDeath=${statistics['stat.timeSinceDeath']};jumps=${statistics['stat.jump']}`)
    }
  }
})
