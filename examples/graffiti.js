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
 *                   Use place for placing and updating signs instead.
 *
 * place [message] - Place a sign from the bots inventory into the world and updates the sign's text.
 */
const mineflayer = require('mineflayer')
const { Vec3 } = require('vec3')

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
  message = message.split(' ').slice(1).join(' ') // Remove the first word. ie place
  // Split the message along its 15 char line limit
  const messageArr = []
  for (let i = 0; i < 4; i++) {
    if (message.length > 15) {
      messageArr.push(message.substring(0, 15).trim())
      message = message.slice(15)
    } else {
      messageArr.push(message)
      break
    }
  }
  message = messageArr.join('\n')

  const signItem = bot.inventory.items().find(i => i.name.includes('sign'))
  if (!signItem) {
    bot.chat('Give me a sign first!')
    return
  }
  await bot.equip(signItem, 'hand')

  // Look for solid blocs first
  const solidBlocks = bot.findBlocks({
    matching: (block) => {
      return block.boundingBox === 'block'
    },
    maxDistance: 4,
    count: 100
  })

  // Then filter for blocks that have an air gap above them
  const placeOnPos = solidBlocks.find((pos) => {
    const block = bot.blockAt(pos.offset(0, 1, 0))
    return block && block.boundingBox === 'empty' && block.name.includes('air')
  })
  const directions = [new Vec3(1, 0, 0), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(0, 0, -1)]
  let placementDir = null
  const placeAgainstPos = solidBlocks.find((pos) => {
    for (const dir of directions) {
      const tmp = bot.blockAt(pos.plus(dir))
      if (tmp?.name.includes('air')) {
        placementDir = dir
        return true
      }
    }
    return false
  })
  if (!placeOnPos && !placeAgainstPos) return bot.chat('No block found to place a sign in')
  if (placeOnPos) {
    await bot.placeSign(placeOnPos.offset(0, 1, 0), message, { writeDelay: 1000 })
  } else {
    await bot.placeSign(placeAgainstPos.plus(placementDir), message, { writeDelay: 1000 })
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
