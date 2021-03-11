/**
 * This example demonstrates how to use anvils w/ mineflayer
 *  the options are: (<Option> are required, [<Option>] are optional)
 * 1. "anvil combine <itemName1> <itemName2> [<name>]"
 * 2. "anvil rename <itemName> <name>"
 *
 * to use this:
 * /op anvilman
 * /gamemode anvilman creative
 * /xp set anvilman 999 levels
 *
 * Put an anvil near the bot
 * Give him a sword and an enchanted book
 * say list
 * say xp
 * say anvil combine diamond_sword enchanted_book
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node use_anvil.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'anvilman',
  password: process.argv[5]
})

let mcData

bot.on('spawn', () => { mcData = require('minecraft-data')(bot.version) })

bot.on('chat', async (username, message) => {
  const command = message.split(' ')

  switch (true) {
    case /^list$/.test(message):
      sayItems()
      break
    case /^toss \w+$/.test(message):
      // toss name
      // ex: toss diamond
      tossItem(command[1])
      break
    case /^xp$/.test(message):
      bot.chat(bot.experience.level)
      break
    case /^gamemode$/.test(message):
      bot.chat(bot.game.gameMode)
      break
    case /^anvil combine \w+ \w+$/.test(message): // anvil firstSlot secondSlot
      combine(bot, command[2], command[3])
      break
    case /^anvil combine \w+ \w+ (.+)$/.test(message): // anvil firstSlot secondSlot name
      combine(bot, command[2], command[3], command.slice(4).join(' '))
      break
    case /^anvil rename \w+ (.+)/.test((message)):
      rename(bot, command[2], command.slice(3).join(' '))
      break
  }
})

function tossItem (name, amount) {
  amount = parseInt(amount, 10)
  const item = itemByName(name)
  if (!item) {
    bot.chat(`I have no ${name}`)
  } else if (amount) {
    bot.toss(item.type, null, amount, checkIfTossed)
  } else {
    bot.tossStack(item, checkIfTossed)
  }

  function checkIfTossed (err) {
    if (err) {
      bot.chat(`unable to toss: ${err.message}`)
    } else if (amount) {
      bot.chat(`tossed ${amount} x ${name}`)
    } else {
      bot.chat(`tossed ${name}`)
    }
  }
}

function itemByName (name) {
  return bot.inventory.items().filter(item => item.name === name)[0]
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function sayItems (items = bot.inventory.items()) {
  const output = items.map(itemToString).join(', ')
  if (output) {
    bot.chat(output)
  } else {
    bot.chat('empty')
  }
}

function getAnvilIds () {
  const matchingBlocks = [mcData.blocksByName.anvil.id]
  if (mcData.blocksByName?.chipped_anvil) {
    matchingBlocks.push(mcData.blocksByName.chipped_anvil.id)
    matchingBlocks.push(mcData.blocksByName.damaged_anvil.id)
  }
  return matchingBlocks
}

async function rename (bot, itemName, name) {
  const anvilBlock = bot.findBlock({
    matching: getAnvilIds()
  })
  const anvil = await bot.openAnvil(anvilBlock)
  try {
    await anvil.rename(itemByName(itemName), name)
    bot.chat('Anvil used successfully.')
  } catch (err) {
    bot.chat(err.message)
  }
  anvil.close()
}

async function combine (bot, itemName1, itemName2, name) {
  const anvilBlock = bot.findBlock({
    matching: getAnvilIds()
  })
  const anvil = await bot.openAnvil(anvilBlock)
  try {
    bot.chat('Using the anvil...')
    await anvil.combine(itemByName(itemName1), itemByName(itemName2), name)
    bot.chat('Anvil used successfully.')
  } catch (err) {
    bot.chat(err.message)
  }
  anvil.close()
}

bot.on('error', console.log)
