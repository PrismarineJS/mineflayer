/*
 * This script will automatically set if a totem is in the inventory or the off-hand.
 * It checks for a totem every tick.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node auto_totem.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'totem',
  password: process.argv[5]
})

bot.on('spawn', () => {
  const totemId = bot.registry.itemsByName.totem_of_undying.id // Get the correct id
  if (bot.registry.itemsByName.totem_of_undying) {
    setInterval(() => {
      const totem = bot.inventory.findInventoryItem(totemId, null)
      if (totem) {
        bot.equip(totem, 'off-hand')
      }
    }, 50)
  }
})
