/*
 * This script will automaticly look at the closest entity.
 * It checks for a near entity every tick.
 */
const mineflayer = require('mineflayer')
const { once } = require('events')

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

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function looker () {
  await once(bot, 'spawn')
  while (true) {
    const entity = bot.nearestEntity()
    if (entity !== null) {
      if (entity.type === 'player') {
        await bot.lookAt(entity.position.offset(0, 1.6, 0))
      } else if (entity.type === 'mob') {
        await bot.lookAt(entity.position)
      }
    }
    await sleep(50)
  }
}

looker()
