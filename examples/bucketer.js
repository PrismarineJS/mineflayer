const mineflayer = require('mineflayer')

// put the bot on grass, give it a water bucket, and say "water_bucket grass_block"
// this just uses any item type on any target block, but is not bot.activateBlock

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 55916,
  username: 'bucket_bot'
})

bot.on('login', async () => {
  bot.on('chat', async (username, message) => {
    if (username === 'bucket_bot') return
    const [toolName, targetName] = message.split(' ')
    // equip water bucket
    const bucket = bot.inventory.items().find(item => item.name === toolName)
    if (!bucket) {
      bot.chat('no ' + toolName)
      return
    }
    await bot.equip(bucket, 'hand')

    const target = bot.findBlock({
      matching: block => block.name === targetName.toLowerCase(),
      maxDistance: 3
    })

    if (!target) {
      bot.chat('no target')
      return
    }

    await bot.lookAt(target.position.offset(0.5, 0.5, 0.5))
    await bot.activateItem() // dont use activateBlock
  })
})
