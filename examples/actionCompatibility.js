/*
 * This example shows how to use the mineflayer actions system to run compatible actions.
 *
 */
const mineflayer = require('mineflayer')
const { ActionData } = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node sign.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'test',
  password: process.argv[5]
})

let mcData
bot.once('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.on('chat', (username, message) => {
  if (message === 'test') {
    moveItemsAndThenDrop()
      .catch(console.error)
  }
})

async function moveItemsAndThenDrop() {
  const item = bot.inventory.items()[0]
  if (!item) return bot.chat('I don\'t have any items')
  bot.transfer({ // Start a asynchronous action
    itemType: item.type,
    destStart: item.slot + 1,
    destEnd: item.slot + 2,
    sourceStart: item.slot,
    sourceEnd: item.slot + 1,
  }).catch(console.error)
  await bot.actionWaitCompatibility(ActionData.actions.simple_inventory_toss)
  // bot.toss(bot.inventory.items()[0].type, null, 1)
}
