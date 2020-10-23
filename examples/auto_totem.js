/*
 * This script will automatically set if a totem is in the inventory or the off-hand.
 * It checks for a totem every tick.
 */
import { createBot } from 'mineflayer'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node auto_totem.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

// TODO: commands
console.log('Commands :\n' +
  '  show villagers\n' +
  '  show inventory\n' +
  '  show trades <id>\n' +
  '  trade <id> <trade> [<times>]')

const bot = createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'auto_totem',
  password: process.argv[5]
})

bot.on('spawn', () => {
  const mcData = require('minecraft-data')(bot.version) // You will know the version when the bot has spawned
  const totemId = mcData.itemsByName.totem_of_undying.id // Get the correct id
  if (mcData.itemsByName.totem_of_undying) {
    setInterval(() => {
      var totem = bot.inventory.findInventoryItem(totemId, null)
      if (totem) {
        bot.equip(totem, 'off-hand')
      }
    }, 50)
  }
})
