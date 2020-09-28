/*
 * This script will automaticly set if a totem is in the inventory the totem in the off-hand.
 * It checks for a totem every tick.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node armor_stand.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'armorStand',
  password: process.argv[5]
})

bot.on('chat', (username, message) => {
  const args = message.split(' ')
  if (args[0] != 'equip') return

  const armorStand = bot.nearestEntity(e => e.mobType === 'Armor Stand' && bot.entity.position.distanceTo(e.position) < 4)
  if (!armorStand) {
    bot.chat("No armor stands nearby!")
    return
  }

  switch (args[1]) {
    case 'helmet':
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 1.8, 0), onError)
      break

    case 'chestplate':
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 1.5, 0), onError)
      break

    case 'leggings':
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 0.9, 0), onError)
      break

    case 'boots':
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 0.1, 0), onError)
      break
  }
})

function onError(err) {
  if (err)
    bot.chat("Failed to equip armor on the armor stand!")
}