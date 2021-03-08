const mineflayer = require('mineflayer')

const bot = mineflayer.createBot()

let mcData //, Item

bot.on('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
  // Item = require('prismarine-item')(bot.version)
})

bot.on('chat', async (u, m) => {
  if (m === 'xp') {
    console.log(bot.experience.level)
  } else
  if (m === 'go') {
    const block = bot.findBlock({ matching: mcData.blocksByName.chest.id })
    await bot.openChest(block)
    await bot.putAway(0)
  }
})
