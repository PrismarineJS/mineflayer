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

bot.on('spawn', function () {
  bot.chat(`/give ${bot.username} crossbow{Enchantments:[{id:quick_charge,lvl:3},{id:unbreaking,lvl:3}]} 1`) // Test with fast charge
  // bot.chat(`/give ${bot.username} crossbow 1`) // Test with slow charge
  bot.chat(`/give ${bot.username} minecraft:arrow 64`)
})

bot.on('chat', async (username, message) => {
  if (message === 'fire') {
    // Check if weapon is equipped
    const slotID = bot.getEquipmentDestSlot('hand')
    if (bot.inventory.slots[slotID] === null || bot.inventory.slots[slotID].name !== 'crossbow') {
      const weaponFound = bot.inventory.items().find(item => item.name === 'crossbow')
      if (weaponFound) {
        await bot.equip(weaponFound, 'hand')
      } else {
        console.log('No weapon in inventory')
        return
      }
    }

    const isEnchanted = bot.heldItem.nbt.value.Enchantments ? bot.heldItem.nbt.value.Enchantments.value.value.find(enchant => enchant.id.value === 'quick_charge') : undefined

    const timeForCharge = 1250 - ((isEnchanted ? isEnchanted.lvl.value : 0) * 250)

    bot.activateItem() // charge
    await sleep(timeForCharge) // wait for crossbow to charge
    bot.deactivateItem() // raise weapon

    try {
      bot.lookAt(bot.players[username].entity.position, true)
      await bot.waitForTicks(5) // wait for lookat to finish
      bot.activateItem() // fire
      bot.deactivateItem()
    } catch (err) {
      bot.chat('Player disappeared, crossbow is charged now.')
    }
  }
})

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
