/*
 * What's better than a bot that knows how to read and understands art?
 *
 * Learn how easy it is to interact with signs and paintings in this example.
 *
 * You can send commands to bot using chat messages.
 * The bot can tell you what is written on the nearest sign, update a sign text
 * or place new signs with given text on it.
 *
 * Commands:
 * read            - Read the text on the nearest sign.
 * write [message] - Update the nearest sign with a given message. May not work on some servers.
 *                   Use place for placing and updating signs instead.
 *
 * place [message] - Place a sign from the bots inventory into the world and updates the sign's text.
 */
const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node sign.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'sign',
  password: process.argv[5],
  version: '1.18.2',
  skipValidation: true
})

let mcData
bot.once('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (true) {
    case /^read$/.test(message):
      readSign()
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

function readSign () {
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
  let lines = message.split(' ').slice(1) // Remove the first word. ie place
  // Trim line length to 15 characters max
  lines = lines.map(l => l.substring(0, 15))

  // Equip the sign item
  const signItem = bot.inventory.items().find(i => i.name.includes('sign'))
  if (!signItem) {
    bot.chat('Give me a sign first!')
    return
  }
  await bot.equip(signItem, 'hand')

  // Check if we can place a sign where we are standing
  const standingIn = bot.blockAt(bot.entity.position)
  const standingOn = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  if (standingIn?.boundingBox !== 'empty' || standingOn?.boundingBox !== 'block') {
    bot.chat('Cannot place a sign here')
    return
  }

  // Place a sign on the block we are standing on facing up
  try {
    await bot.placeSign(standingIn, new Vec3(0, 1, 0), lines, { writeDelay: 1000 })
  } catch (err) {
    bot.chat('Failed to place the sign')
    return
  }
  bot.chat('Sign placed')
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
