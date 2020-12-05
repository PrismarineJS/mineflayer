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

bot.on('chat', async (username, message) => {
  const args = message.split(' ')
  if (args[0] !== 'equip' && args[0] !== 'unequip') return

  const armorStand = bot.nearestEntity(e => e.mobType === 'Armor Stand' && bot.entity.position.distanceTo(e.position) < 4)
  if (!armorStand) {
    bot.chat('No armor stands nearby!')
    return
  }

  if (args[0] === 'equip') {
    let armor

    if (args[1] === 'helmet') {
      armor = bot.inventory.items().find(item => item.name.includes('helmet'))
    } else if (args[1] === 'chestplate') {
      armor = bot.inventory.items().find(item => item.name.includes('chestplate'))
    } else if (args[1] === 'leggings') {
      armor = bot.inventory.items().find(item => item.name.includes('leggings'))
    } else if (args[1] === 'boots') {
      armor = bot.inventory.items().find(item => item.name.includes('boots'))
    }

    if (!armor) {
      bot.chat('I have no armor items in my inventory!')
      return
    }

    await bot.equip(armor, 'hand')
    bot.activateEntityAt(armorStand, armorStand.position)
  } else if (args[0] === 'unequip') {
    await bot.unequip('hand')
    if (args[1] === 'helmet') {
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 1.8, 0))
    } else if (args[1] === 'chestplate') {
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 1.2, 0))
    } else if (args[1] === 'leggings') {
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 0.75, 0))
    } else if (args[1] === 'boots') {
      bot.activateEntityAt(armorStand, armorStand.position.offset(0, 0.1, 0))
    }
  }
})
