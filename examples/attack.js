/*
 *
 * A bot that attacks the player that sends a message or the nearest entity (excluding players)
 *
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node attack.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'attack',
  password: process.argv[5]
})

bot.on('spawn', () => {
  bot.on('chat', (username, message) => {
    if (message === 'attack me') attackPlayer(username)
    else if (message === 'attack') attackEntity()
  })
})

function attackPlayer (username) {
  const player = bot.players[username]
  if (!player || !player.entity) {
    bot.chat('I can\'t see you')
  } else {
    bot.chat(`Attacking ${player.username}`)
    bot.attack(player.entity)
  }
}

function attackEntity () {
  const entity = bot.nearestEntity()
  if (!entity) {
    bot.chat('No nearby entities')
  } else {
    bot.chat(`Attacking ${entity.name ?? entity.username}`)
    bot.attack(entity)
  }
}
