const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node raycast.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'raycast',
  password: process.argv[5]
})

bot.on('message', (cm) => {
  if (cm.toString().includes('block')) {
    block()
  }
})

function block () {
  const block = bot.blockInSight()

  if (!block) {
    return bot.chat('Looking at Air')
  }

  bot.chat(`Looking at ${block.displayName}`)
}
