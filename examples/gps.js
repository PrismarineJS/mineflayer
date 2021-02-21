// This is an example that uses mineflayer-pathfinder to showcase how simple it is to walk to goals
// * Requires the npm package "mineflayer-pathfinder"

const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node gps.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'gps',
  password: process.argv[5]
})

const PROXIMITY_GOAL = 1 // walk to the bot +/- this many blocks

bot.loadPlugin(pathfinder)

bot.once('spawn', startBot)

function startBot () {
  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    const target = bot.players[username] ? bot.players[username].entity : null
    if (message === 'come') {
      if (!target) {
        bot.chat("I don't see you !")
        return
      }
      const { x: playerX, y: playerY, z: playerZ } = target.position

      bot.pathfinder.setMovements(defaultMove)
      bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, PROXIMITY_GOAL))
    }
  })
}
