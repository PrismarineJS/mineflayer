/*
 * This script will automaticly look at the closest entity.
 * It checks for a near entity every tick.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node echo.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'looker',
  password: process.argv[5]
})

bot.once('spawn', function () {
  setInterval(() => {
    var entity = nearestEntity()
    if (entity) {
      if (entity.type === 'player') {
        bot.lookAt(entity.position.offset(0, 1.6, 0))
      } else if (entity.type === 'mob') {
        bot.lookAt(entity.position)
      }
    }
  }, 50)
})

function nearestEntity (type) {
  let id, entity, dist
  const best = null
  const bestDistance = null

  for (id in bot.entities) {
    entity = bot.entities[id]

    if (type && entity.type !== type) continue

    if (entity === bot.entity) continue

    dist = bot.entity.position.distanceTo(entity.position)

    if (!best || dist < bestDistance) {
      best = entity
      bestDistance = dist
    }
  }

  return best
}
