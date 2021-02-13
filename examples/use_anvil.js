const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node use_anvil.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'anvilman',
  password: process.argv[5]
})

bot.on('chat', async (username, message) => {
  const mcData = require('minecraft-data')(bot.version)
  if (message === 'interact') {
    const anvilBlock = bot.findBlock({
      matching: [
        mcData.blocksByName.anvil.id,
        mcData.blocksByName.chipped_anvil.id,
        mcData.blocksByName.damaged_anvil.id
      ]
    })
    const anvil = await bot.openAnvil(anvilBlock)
    bot.chat('Anvil opened.')
    try {
      await anvil.useAnvil(bot.inventory.hotbarStart, bot.inventory.hotbarStart + 1, 'ok')
      console.log('Anvil used successfully.')
    } catch (err) {
      console.log(err)
    }
  }
})

bot.on('error', console.log)
