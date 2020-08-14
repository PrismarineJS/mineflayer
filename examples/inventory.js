/*
 * Using the inventory is one of the first things you learn in Minecraft,
 * now it's time to teach your bot the same skill.
 *
 * Command your bot with chat messages and make him toss, equip, use items
 * and even craft new items using the built-in recipe book.
 *
 * To learn more about the recipe system and how crafting works
 * remember to read the API documentation!
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node inventory.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'inventory',
  password: process.argv[5]
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  const command = message.split(' ')
  switch (true) {
    case message === 'loaded':
      bot.waitForChunksToLoad(() => {
        bot.chat('Ready!')
      })
      break
    case /^list$/.test(message):
      sayItems()
      break
    case /^toss \d+ \w+$/.test(message):
      // toss amount name
      // ex: toss 64 diamond
      tossItem(command[2], command[1])
      break
    case /^toss \w+$/.test(message):
      // toss name
      // ex: toss diamond
      tossItem(command[1])
      break
    case /^equip \w+ \w+$/.test(message):
      // equip destination name
      // ex: equip hand diamond
      equipItem(command[2], command[1])
      break
    case /^unequip \w+$/.test(message):
      // unequip testination
      // ex: unequip hand
      unequipItem(command[1])
      break
    case /^use$/.test(message):
      useEquippedItem()
      break
    case /^craft \d+ \w+$/.test(message):
      // craft amount item
      // ex: craft 64 stick
      craftItem(command[2], command[1])
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

function equipItem (name, destination) {
  const item = itemByName(name)
  if (item) {
    bot.equip(item, destination, checkIfEquipped)
  } else {
    bot.chat(`I have no ${name}`)
  }

  function checkIfEquipped (err) {
    if (err) {
      bot.chat(`cannot equip ${name}: ${err.message}`)
    } else {
      bot.chat(`equipped ${name}`)
    }
  }
}

function unequipItem (destination) {
  bot.unequip(destination, (err) => {
    if (err) {
      bot.chat(`cannot unequip: ${err.message}`)
    } else {
      bot.chat('unequipped')
    }
  })
}

function useEquippedItem () {
  bot.chat('activating item')
  bot.activateItem()
}

function craftItem (name, amount) {
  amount = parseInt(amount, 10)
  const item = require('minecraft-data')(bot.version).findItemOrBlockByName(name)
  const craftingTable = bot.findBlock({
    matching: 58
  })

  if (item) {
    const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
    if (recipe) {
      bot.chat(`I can make ${name}`)
      bot.craft(recipe, amount, craftingTable, (err) => {
        if (err) {
          bot.chat(`error making ${name}`)
        } else {
          bot.chat(`did the recipe for ${name} ${amount} times`)
        }
      })
    } else {
      bot.chat(`I cannot make ${name}`)
    }
  } else {
    bot.chat(`unknown item: ${name}`)
  }
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function itemByName (name) {
  return bot.inventory.items().filter(item => item.name === name)[0]
}
