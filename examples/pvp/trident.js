const mineflayer = require('mineflayer')
const projectile = require('mineflayer-projectile')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node trident.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'anvilman',
  password: process.argv[5]
})

bot.once('login', login)

// within 10 seconds of logging in, find a new target to shoot
function login () {
  bot.loadPlugin(projectile)
  setTimeout(scan, 10 * 1000)
}

async function delay (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// scan the area for enemies and shoot the closest player in sight
async function scan () {
  const target = bot.nearestEntity(entity => entity.name.toLowerCase() === 'player')
  if (target) {
    bot.chat('Sniping\'s a good job mate.')
    await shoot(target)
  }
  return !!target
}

// charge and aim the trident
async function shoot (target) {
  bot.activateItem()

  // allow enough time to charge the trident (10 ticks)
  await delay(1000)
  const angle = bot.projectile.getAngle(bot.projectile.types.trident, bot.entity.position, target.position)
  await bot.look(angle.x, angle.y)

  bot.deactivateItem()
}
