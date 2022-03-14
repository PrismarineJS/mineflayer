const { createBot } = require('mineflayer')

const bot = createBot({ port: 25566 })

bot.on('messagestr', async msg => {
  if (msg.endsWith('c')) {
    const block = bot.findBlock({ matching: b => b.name === 'anvil' })
    if (block !== null) {
      bot.chat('Found anvil')
    } else {
      bot.chat("Couldn't find anvil")
      return
    }
    const anvil = await bot.openAnvil(block)
    if (anvil !== null) {
      bot.chat('Got anvil object')
    } else {
      bot.chat("Couldn't get anvil obj")
      return
    }
    bot.chat('Starting combine')
    await anvil.combine(anvil.findInventoryItem(bot.registry.itemsByName.diamond_sword.id), anvil.findInventoryItem(bot.registry.itemsByName.enchanted_book.id))
    await anvil.close()
    bot.chat('Combine')
    console.log(bot.inventory.items())
  }
})
