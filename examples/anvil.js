// This example demonstrates how to use anvils w/ mineflayer
// the options are: (<Option> are required, [<Option>] are optional)
// 1. "anvil combine <slotOne> <slotTwo> [<name>]"
// 2. "anvil rename <slot> <name>"
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
  if (!message.startsWith('anvil')) return
  if (message.includes('combine')) {
    const [, firstSlot, secondSlot, name] = message.match(/^anvil combine (\d+) (\d+)(?: (.+))?/)
    switch (true) {
      case /^anvil combine \d+ \d+$/.test(message): // anvil firstSlot secondSlot
        combine(bot, firstSlot, secondSlot)
        break
      case /^anvil combine (\d+) (\d+) (.+)$/.test(message): // anvil firstSlot secondSlot name
        combine(bot, firstSlot, secondSlot, name)
        break
    }
  } else if (message.match(/^anvil rename (\d+) (.+)/)) {
    const [, slot, name] = message.match(/^anvil rename (\d+) (.+)/)
    rename(bot, slot, name)
  }
})

function getAnvilIds () {
  const matchingBlocks = [mcData.blocksByName.anvil.id]
  if (mcData.blocksByName?.chipped_anvil) {
    matchingBlocks.push(mcData.blocksByName.chipped_anvil.id)
    matchingBlocks.push(mcData.blocksByName.damaged_anvil.id)
  }
  return matchingBlocks
}

async function rename (bot, slot, name) {
  const anvilBlock = bot.findBlock({
    matching: getAnvilIds()
  })
  const anvil = await bot.openAnvil(anvilBlock)
  try {
    await anvil.rename(bot.inventory.slots[Number.parseInt(slot)], name)
    bot.chat('Anvil used successfully.')
  } catch (err) {
    bot.chat(err.message)
  }
  anvil.close()
}

async function combine (bot, slotOne, slotTwo, name) {
  const anvilBlock = bot.findBlock({
    matching: getAnvilIds()
  })
  const anvil = await bot.openAnvil(anvilBlock)
  try {
    await anvil.combine(bot.inventory.slots[Number.parseInt(slotOne)], bot.inventory.slots[Number.parseInt(slotTwo)], name)
    bot.chat('Anvil used successfully.')
  } catch (err) {
    bot.chat(err.message)
  }
  anvil.close()
}

bot.on('error', console.log)
