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
const { on } = require('events')

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

// Resolves on the first physics tick on which we are above y, or throws once ms
// have passed.
async function waitUntilAbove (y, ms) {
  for await (const _ of on(bot, 'physicsTick', { signal: AbortSignal.timeout(ms) })) { // eslint-disable-line no-unused-vars
    if (bot.entity.position.y > y) return
  }
}

async function build () {
  // Digging is instant in creative mode, so we may still be standing over the
  // hole we just dug: build on the first solid block below us, not on the one
  // at our feet.
  let referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  for (let i = 0; i < 2 && referenceBlock && referenceBlock.boundingBox !== 'block'; i++) {
    referenceBlock = bot.blockAt(referenceBlock.position.offset(0, -1, 0))
  }
  if (!referenceBlock || referenceBlock.boundingBox !== 'block') {
    bot.chat('cannot build: there is no solid block below me')
    return
  }
  // Our feet must be above the block we place on top of the reference block
  const jumpY = referenceBlock.position.y + 2

  // Jump, and place a block under our feet once we are high enough. Jumping
  // only starts once we stand on the reference block, so if we have not fallen
  // into the hole yet we first fall, then jump.
  let lastError
  bot.setControlState('jump', true)
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        // Falling into the hole and jumping out take about 20 ticks
        await waitUntilAbove(jumpY, 2000)
      } catch (err) {
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
