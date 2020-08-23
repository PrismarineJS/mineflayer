/*
 * This example demonstrates how to save a world with mineflayer and
 * https://github.com/PrismarineJS/prismarine-provider-anvil
 */

const mineflayer = require('mineflayer')
const fs = require('fs')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node saver.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'saver',
  password: process.argv[5],
  storageBuilder: ({ version, worldName }) => {
    const Anvil = require('prismarine-provider-anvil').Anvil(version)
    worldName = worldName.replace(/:/g, '_')
    fs.mkdirSync(worldName)
    return new Anvil(worldName)
  }
})

bot.on('spawn', () => {
  bot.waitForChunksToLoad(() => {
    console.log('World saved!')
  })
})
