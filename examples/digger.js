/*
 * Never spend hours mining from ground to bedrock again!
 *
 * Learn how to create a simple bot that is capable of digging the block
 * below his feet and then going back up by creating a dirt column to the top.
 *
 * As always, you can send the bot commands using chat messages, and monitor
 * his inventory at any time.
 *
 * Remember that in survival mode he might not have enough dirt to get back up,
 * so be sure to teach him a few more tricks before leaving him alone at night.
 */
const mineflayer = require('mineflayer')
const vec3 = require('vec3')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node digger.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'digger',
  password: process.argv[5]
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'loaded':
      await bot.waitForChunksToLoad()
      bot.chat('Ready!')
      break
    case 'list':
      sayItems()
      break
    case 'dig':
      dig()
      break
    case 'build':
      build()
      break
    case 'equip dirt':
      equipDirt()
      break
  }
})

function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    bot.chat(output)
  } else {
    bot.chat('empty')
  }
}

async function dig () {
  let target
  if (bot.targetDigBlock) {
    bot.chat(`already digging ${bot.targetDigBlock.name}`)
  } else {
    target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    if (target && bot.canDigBlock(target)) {
      bot.chat(`starting to dig ${target.name}`)
      try {
        await bot.dig(target)
        bot.chat(`finished digging ${target.name}`)
      } catch (err) {
        console.log(err.stack)
      }
    } else {
      bot.chat('cannot dig')
    }
  }
}

function build () {
  const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  const jumpY = Math.floor(bot.entity.position.y) + 1.0
  bot.setControlState('jump', true)
  bot.on('move', placeIfHighEnough)

  let tryCount = 0

  async function placeIfHighEnough () {
    if (bot.entity.position.y > jumpY) {
      try {
        await bot.placeBlock(referenceBlock, vec3(0, 1, 0))
        bot.setControlState('jump', false)
        bot.removeListener('move', placeIfHighEnough)
        bot.chat('Placing a block was successful')
      } catch (err) {
        tryCount++
        if (tryCount > 10) {
          bot.chat(err.message)
          bot.setControlState('jump', false)
          bot.removeListener('move', placeIfHighEnough)
        }
      }
    }
  }
}

async function equipDirt () {
  let itemsByName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    itemsByName = 'itemsByName'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    itemsByName = 'blocksByName'
  }
  try {
    await bot.equip(bot.registry[itemsByName].dirt.id, 'hand')
    bot.chat('equipped dirt')
  } catch (err) {
    bot.chat(`unable to equip dirt: ${err.message}`)
  }
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}
