const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node crystal.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'crystal',
  password: process.argv[5]
})

bot.on('chat', (username, message) => {
  if (message === 'compute') {
    const target = bot.players[username]?.entity
    if (!target) {
      bot.chat('I don\'t know where you are')
      return
    }
    const crystal = bot.nearestEntity(entity => entity.name.includes('crystal'))
    if (!crystal) {
      bot.chat('No crystal nearby')
      return
    }

    const damages = bot.getExplosionDamages(target, crystal.position, 6)

    bot.chat(`You'll take ${damages} damages.`)
  }
})
