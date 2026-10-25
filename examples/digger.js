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
        await waitToLand()
        bot.chat(`finished digging ${target.name}`)
      } catch (err) {
        console.log(err.stack)
      }
    } else {
      bot.chat('cannot dig')
    }
  }
}

// Digging can finish before the bot has started to fall (in creative mode it
// is instant), so give physics a tick and then wait until the bot stands on
// something again.
async function waitToLand () {
  await bot.waitForTicks(1)
  for (let i = 0; i < 20 && !bot.entity.onGround; i++) {
    await bot.waitForTicks(1)
  }
}

async function build () {
  // Only read our position once we have settled, otherwise we might try to
  // build on the block we just dug.
  await waitToLand()
  const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  if (!referenceBlock || referenceBlock.boundingBox !== 'block') {
    bot.chat('cannot build: there is no solid block below me')
    return
  }
  const jumpY = Math.floor(bot.entity.position.y) + 1.0

  // Jump, and place a block under our feet once we are high enough
  let lastError
  bot.setControlState('jump', true)
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      // A jump takes about 12 ticks: if we are not high enough after 20,
      // we never will be.
      for (let tick = 0; tick < 20 && bot.entity.position.y <= jumpY; tick++) {
        await bot.waitForTicks(1)
      }
      if (bot.entity.position.y <= jumpY) {
        lastError = new Error('could not jump high enough')
        break
      }
      try {
        await bot.placeBlock(referenceBlock, vec3(0, 1, 0))
        bot.chat('Placing a block was successful')
        return
      } catch (err) {
        lastError = err
      }
    }
  } finally {
    bot.setControlState('jump', false)
  }
  bot.chat(`failed to place a block: ${lastError.message}`)
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
