const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node bee.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'bee',
  password: process.argv[5],
  verbose: true
})

// /gamemode creative bee

async function loop (n) {
  for (let i = 0; i <= n; i++) {
    const { position } = bot.entity
    await bot.creative.flyTo(position.offset(Math.sin(i) * 2, 0.5, Math.cos(i) * 2))
  }
  bot.chat('My flight was amazing !')
}

bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'loaded':
      await bot.waitForChunksToLoad()
      bot.chat('Ready!')
      break
    case 'fly':
      bot.creative.startFlying()
      loop(10)
      break
  }
})
