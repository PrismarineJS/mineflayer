/*
 * This simple bot will help you find any block
 */
import { createBot } from 'mineflayer'
import { performance } from 'perf_hooks'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node blockfinder.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

// TODO: commands
console.log('Commands :\n' +
  '  loaded\n' +
  '  starts with find')

const bot = createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'blockfinder',
  password: process.argv[5]
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return

  const mcData = require('minecraft-data')(bot.version)

  if (message === 'loaded') {
    console.log(bot.entity.position)
    bot.waitForChunksToLoad(() => {
      bot.chat('Ready!')
    })
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
