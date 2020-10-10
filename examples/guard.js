/**
 * This bot example shows the basic usage of the mineflayer-pvp plugin for guarding a defined area from nearby mobs.
 */

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node guard.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'Guard',
  password: process.argv[5]
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

let guardPos = null

// Assign the given location to be guarded
function guardArea (pos) {
  guardPos = pos

  // We we are not currently in combat, move to the guard pos
  if (!bot.pvp.target) {
    moveToGuardPos()
  }
}

// Cancel all pathfinder and combat
function stopGuarding () {
  guardPos = null
  bot.pvp.stop()
  bot.pathfinder.setGoal(null)
}

// Pathfinder to the guard position
function moveToGuardPos () {
  const mcData = require('minecraft-data')(bot.version)
  bot.pathfinder.setMovements(new Movements(bot, mcData))
  bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z))
}

// Called when the bot has killed it's target.
bot.on('stoppedAttacking', () => {
  if (guardPos) {
    moveToGuardPos()
  }
})

// Check for new enemies to attack
bot.on('physicTick', () => {
  if (!guardPos) return // Do nothing if bot is not guarding anything

  // Only look for mobs within 16 blocks
  const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
                    e.mobType !== 'Armor Stand' // Mojang classifies armor stands as mobs for some reason?

  const entity = bot.nearestEntity(filter)
  if (entity) {
    // Start attacking
    bot.pvp.attack(entity)
  }
})

// Listen for player commands
bot.on('chat', (username, message) => {
  // Guard the location the player is standing
  if (message === 'guard') {
    const player = bot.players[username]

    if (!player) {
      bot.chat("I can't see you.")
      return
    }

    bot.chat('I will guard that location.')
    guardArea(player.entity.position)
  }

  // Stop guarding
  if (message === 'stop') {
    bot.chat('I will no longer guard this area.')
    stopGuarding()
  }
})
