/*
 * What's better than a bot that knows how to read and understands art?
 *
 * Learn how easy it is to interact with signs and paintings in this example.
 *
 * You can send commands to this bot using chat messages, the bot will
 * reply by telling you the text written on the nearest sign, and you can also
 * update signs with custom messages!
 *
 * Commands:
 * write [message] - Update the nearest sign with a given message. May not work on some servers.
 *                   Use place for placing and updating signs instead
 *
 * place [message] - Place a sign from the bots inventory into the world and update the signs text.
 */
const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')
const { onceWithCleanup } = require('../lib/promise_utils')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node graffiti.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'graffiti',
  password: process.argv[5]
})

let mcData
bot.once('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (true) {
    case /^watch$/.test(message):
      watchSign()
      break
    case /^write .+$/.test(message):
      // write message
      // ex: write I love diamonds
      updateSign(message)
      break
    case /^place .+$/.test(message):
      placeSign(message)
  }
})

function watchSign () {
  const signBlock = bot.findBlock({
    matching: mcData.blocksArray.filter(b => b.name.includes('sign')).map(b => b.id)
  })
  if (signBlock) {
    bot.chat(`The sign says: ${signBlock.signText}`)
  } else {
    bot.chat('There are no signs or paintings near me')
  }
}

async function placeSign (message) {
  const signItem = bot.inventory.items().find(i => i.name.includes('sign'))
  if (!signItem) {
    bot.chat('Give me a sign first!')
    return
  }
  await bot.equip(signItem, 'hand')
  // Look for solid blocs first
  const freeBlocks = bot.findBlocks({
    matching: (block) => {
      return block.boundingBox === 'block'
    },
    maxDistance: 4,
    count: 100
  })
  // Then filter for blocks that have an air gap above them
  const freeBlock = bot.blockAt(freeBlocks.find((pos) => {
    const block = bot.blockAt(pos.offset(0, 1, 0))
    return block && block.boundingBox === 'empty' && block.name.includes('air')
  }))
  if (!freeBlock) {
    bot.chat('No free block to place a sign on')
    return
  }

  // Wait for the right event to fire that indicates that we have opened our sign gui
  // If we update the sign text before this event fires the server might reject the sign text
  const signGuiOpen = onceWithCleanup(bot, 'signOpen', {
    timeout: 5000,
    checkCondition: (data) => {
      const { x, y, z } = data.location
      return new Vec3(x, y, z).distanceTo(freeBlock.position.offset(0, 1, 0)) === 0
    }
  })

  try {
    // Start both tasks at once: Block placement and listening for the sign gui opening.
    // Then wait for both actions to finish
    const placeBlockProm = bot.placeBlock(freeBlock, new Vec3(0, 1, 0))
    await Promise.allSettled([placeBlockProm, signGuiOpen])
    bot.updateSign(bot.blockAt(freeBlock.position.offset(0, 1, 0)), message.split(' ').slice(1).join(' '))
  } catch (err) {
    console.error(err)
    bot.chat('Block placement failed')
    return
  }

  bot.chat('Sign placed and updated')
}

function updateSign (message) {
  const signBlock = bot.findBlock({
    matching: mcData.blocksArray.filter(b => b.name.includes('sign')).map(b => b.id)
  })
  if (signBlock) {
    bot.updateSign(signBlock, message.split(' ').slice(1).join(' '))
    bot.chat('Sign updated')
  } else {
    bot.chat('There are no signs near me')
  }
}
