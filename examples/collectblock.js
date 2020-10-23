/**
 * A quick and easy implementation of the collect block plugin. (Requires mineflayer-pathfinder and mineflayer-collectblock)
 */
import { createBot } from 'mineflayer'
import { pathfinder } from 'mineflayer-pathfinder'
import { plugin as collectBlock } from 'mineflayer-collectblock'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node collectblock.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'collectblock',
  password: process.argv[5]
})

// Load pathfinder and collect block plugins
bot.loadPlugin(pathfinder)
bot.loadPlugin(collectBlock)

// Load mc data
let mcData
bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
})

// Listen for when a player says "collect [something]" in chat
bot.on('chat', (username, message) => {
  const args = message.split(' ')
  if (args[0] !== 'collect') return

  // Get the correct block type
  const blockType = mcData.blocksByName[args[1]]
  if (!blockType) {
    bot.chat("I don't know any blocks with that name.")
    return
  }

  bot.chat('Collecting the nearest ' + blockType.name)

  // Try and find that block type in the world
  const block = bot.findBlock({
    matching: blockType.id,
    maxDistance: 64
  })

  if (!block) {
    bot.chat("I don't see that block nearby.")
    return
  }

  // Collect the block if we found one
  bot.collectBlock.collect(block, err => {
    if (err) bot.chat(err.message)
  })
})
