// This example will shoot the player that said "fire" in chat, when it is said in chat.
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node crossbower.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'crossbower',
  password: process.argv[5]
})

bot.on('chat', async (username, message) => {
  if (message === 'fire') {
    if (bot.heldItem.nbt.value.Charged.value !== 1) { // already charged
      bot.activateItem() // charge
      await bot.waitForTicks(25) // wait for crossbow to charge, number from minecraft wiki
      bot.deactivateItem() // raise weapon
    }
    try {
      bot.lookAt(bot.players[username].entity.position, true)
      await bot.waitForTicks(5) // wait for lookat to finish
      bot.activateItem() // fire
    } catch (err) {
      bot.chat('Player disappeared, crossbow is charged now.')
    }
  }
})
