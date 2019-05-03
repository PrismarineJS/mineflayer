const Vec3 = require('vec3')
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node scoreboard.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'farmer',
  password: process.argv[5],
  verbose: true
})

// To fish we have to give bot the seeds
// /give farmer wheat_seeds 64

const ID_FARMLAND = 60
const ID_WHEAT = 59
const ID_SEEDS = 295

function blockToSow () {
  return bot.findBlock({
    point: bot.entity.position,
    matching: (block) => {
      if (block && block.type === ID_FARMLAND) {
        const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
        return !blockAbove || blockAbove.type === 0
      }

      return false
    }
  })
}

function blockToHarvest () {
  return bot.findBlock({
    point: bot.entity.position,
    matching: (block) => {
      return block && block.type === ID_WHEAT && block.metadata === 7
    }
  })
}

function loop () {
  try {
    const toHarvest = blockToHarvest()
    if (toHarvest) {
      return bot.dig(toHarvest, () => {
        return setTimeout(loop, 1000)
      })
    }

    const toSow = blockToSow()
    if (toSow) {
      return bot.equip(ID_SEEDS, 'hand', () => {
        bot.placeBlock(toSow, new Vec3(0, 1, 0), () => {
          setTimeout(loop, 1000)
        })
      })
    }

    setTimeout(loop, 1000)
  } catch (e) {
    console.log(e)
    setTimeout(loop, 1000)
  }
}

bot.on('login', loop)
