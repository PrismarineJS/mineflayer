/*
 * This script will automaticly set if a totem is in the inventory the totem in the off-hand.
 * It checks for a totem every secound.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node echo.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'totem',
  password: process.argv[5]
})

setInterval(() => {  
  var totem = bot.inventory.findInventoryItem(449, null);
  if (totem && totem.type === 449) {
    bot.equip(totem, "off-hand");
  }
}, 1000)
