/*
 * This simple bot will help you find any block
 */
const mineflayer = require('mineflayer')

const { performance } = require('perf_hooks')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node blockfinder.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'finder',
  password: process.argv[5]
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return

  const mcData = require('minecraft-data')(bot.version)

  if (message === 'loaded') {
    console.log(bot.entity.position)
    await bot.waitForChunksToLoad()
    bot.chat('Ready!')
  }

  if (message.startsWith('find')) {
    const name = message.split(' ')[1]
    if (mcData.blocksByName[name] === undefined) {
      bot.chat(`${name} is not a block name`)
      return
    }
    const ids = [mcData.blocksByName[name].id]

    const startTime = performance.now()
    const blocks = bot.findBlocks({ matching: ids, maxDistance: 128, count: 10 })
    const time = (performance.now() - startTime).toFixed(2)

    bot.chat(`I found ${blocks.length} ${name} blocks in ${time} ms`)
  }
})
