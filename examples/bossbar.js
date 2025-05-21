const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node bossbar.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'bossbar_bot',
  password: process.argv[5]
})

// Wait for spawn
bot.once('spawn', () => {
  console.log('Bot spawned!')

  // Create a boss bar
  bot.chat('/bossbar add test:bar "Test Boss Bar"')
  bot.chat('/bossbar set test:bar players ' + bot.username)
  bot.chat('/bossbar set test:bar color red')
  bot.chat('/bossbar set test:bar style notched_6')
  bot.chat('/bossbar set test:bar value 50')
})

// Listen for boss bar events
bot.on('bossBarCreated', (bossBar) => {
  console.log('Boss bar created:', bossBar.title.toString())
})

bot.on('bossBarUpdated', (bossBar) => {
  console.log('Boss bar updated:', {
    title: bossBar.title.toString(),
    health: bossBar.health,
    color: bossBar.color,
    dividers: bossBar.dividers
  })
})

bot.on('bossBarDeleted', (bossBar) => {
  console.log('Boss bar deleted:', bossBar.title.toString())
})

// After 5 seconds, update the boss bar
setTimeout(() => {
  bot.chat('/bossbar set test:bar color blue')
  bot.chat('/bossbar set test:bar style notched_10')
  bot.chat('/bossbar set test:bar value 75')
}, 5000)

// After 10 seconds, remove the boss bar
setTimeout(() => {
  bot.chat('/bossbar remove test:bar')
}, 10000)
