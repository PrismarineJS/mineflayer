/*
 * This script will apply armor onto an armor stand within 4 blocks of the bot
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

const armorTypes = {
  helmet: [0, 1.8, 0],
  chestplate: [0, 1.2, 0],
  leggings: [0, 0.75, 0],
  boots: [0, 0.1, 0]
}

bot.on('chat', async (username, message) => {
  const [mainCommand, subCommand] = message.split(' ')
  if (mainCommand !== 'equip' && mainCommand !== 'unequip') return

  const armorStand = bot.nearestEntity(e => e.mobType === 'Armor Stand' && bot.entity.position.distanceTo(e.position) < 4)
  if (!armorStand) {
    bot.chat('No armor stands nearby!')
    return
  }

  if (mainCommand === 'equip') {
    let armor = null
    // parse chat
    Object.keys(armorTypes).forEach(armorType => {
      if (subCommand !== armorType) return
      armor = bot.inventory.items().find(item => item.name.includes(armorType))
    })

    if (armor === null) {
      bot.chat('I have no armor items in my inventory!')
      return
    }

    await bot.equip(armor, 'hand')
    bot.activateEntityAt(armorStand, armorStand.position)
  } else if (mainCommand === 'unequip') {
    await bot.unequip('hand')

    const offset = armorTypes[subCommand]
    if (!offset) return

    bot.activateEntityAt(armorStand, armorStand.position.offset(...offset))
  }
})
