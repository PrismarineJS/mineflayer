/*
 * Watch out, this is a big one!
 *
 * This is a demonstration to show you how you can interact with:
 * - Chests
 * - Furnaces
 * - Dispensers
 * - Enchantment Tables
 *
 * and of course with your own inventory.
 *
 * Each of the main commands makes the bot interact with the block and open
 * its window. From there you can send another set of commands to actually
 * interact with the window and make awesome stuff.
 *
 * There's also a bonus example which shows you how to use the /invsee command
 * to see what items another user has in his inventory and what items he has
 * equipped.
 * This last one is usually reserved to Server Ops so make sure you have the
 * appropriate permission to do it or it won't work.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node chest.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'chest',
  password: process.argv[5]
})

bot.on('experience', () => {
  bot.chat(`I am level ${bot.experience.level}`)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (true) {
    case /^list$/.test(message):
      sayItems()
      break
    case /^chest$/.test(message):
      watchChest(false, ['chest', 'ender_chest', 'trapped_chest'])
      break
    case /^furnace$/.test(message):
      watchFurnace()
      break
    case /^dispenser$/.test(message):
      watchChest(false, ['dispenser'])
      break
    case /^enchant$/.test(message):
      watchEnchantmentTable()
      break
    case /^chestminecart$/.test(message):
      watchChest(true)
      break
    case /^invsee \w+( \d)?$/.test(message): {
      // invsee Herobrine [or]
      // invsee Herobrine 1
      const command = message.split(' ')
      useInvsee(command[0], command[1])
      break
    }
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

async function watchChest (minecart, blocks = []) {
  let chestToOpen
  if (minecart) {
    chestToOpen = Object.keys(bot.entities)
      .map(id => bot.entities[id]).find(e => e.entityType === bot.registry.entitiesByName.chest_minecart &&
      e.objectData.intField === 1 &&
      bot.entity.position.distanceTo(e.position) < 3)
    if (!chestToOpen) {
      bot.chat('no chest minecart found')
      return
    }
  } else {
    chestToOpen = bot.findBlock({
      matching: blocks.map(name => bot.registry.blocksByName[name].id),
      maxDistance: 6
    })
    if (!chestToOpen) {
      bot.chat('no chest found')
      return
    }
  }
  const chest = await bot.openContainer(chestToOpen)
  sayItems(chest.containerItems())
  chest.on('updateSlot', (slot, oldItem, newItem) => {
    bot.chat(`chest update: ${itemToString(oldItem)} -> ${itemToString(newItem)} (slot: ${slot})`)
  })
  chest.on('close', () => {
    bot.chat('chest closed')
  })

  bot.on('chat', onChat)

  function onChat (username, message) {
    if (username === bot.username) return
    const command = message.split(' ')
    switch (true) {
      case /^close$/.test(message):
        closeChest()
        break
      case /^withdraw \d+ \w+$/.test(message):
        // withdraw amount name
        // ex: withdraw 16 stick
        withdrawItem(command[2], command[1])
        break
      case /^deposit \d+ \w+$/.test(message):
        // deposit amount name
        // ex: deposit 16 stick
        depositItem(command[2], command[1])
        break
    }
  }

  function closeChest () {
    chest.close()
    bot.removeListener('chat', onChat)
  }

  async function withdrawItem (name, amount) {
    const item = itemByName(chest.containerItems(), name)
    if (item) {
      try {
        await chest.withdraw(item.type, null, amount)
        bot.chat(`withdrew ${amount} ${item.name}`)
      } catch (err) {
        bot.chat(`unable to withdraw ${amount} ${item.name}`)
      }
    } else {
      bot.chat(`unknown item ${name}`)
    }
  }

  async function depositItem (name, amount) {
    const item = itemByName(chest.items(), name)
    if (item) {
      try {
        await chest.deposit(item.type, null, amount)
        bot.chat(`deposited ${amount} ${item.name}`)
      } catch (err) {
        bot.chat(`unable to deposit ${amount} ${item.name}`)
      }
    } else {
      bot.chat(`unknown item ${name}`)
    }
  }
}

async function watchFurnace () {
  const furnaceBlock = bot.findBlock({
    matching: ['furnace', 'lit_furnace'].filter(name => bot.registry.blocksByName[name] !== undefined).map(name => bot.registry.blocksByName[name].id),
    maxDistance: 6
  })
  if (!furnaceBlock) {
    bot.chat('no furnace found')
    return
  }
  const furnace = await bot.openFurnace(furnaceBlock)
  let output = ''
  output += `input: ${itemToString(furnace.inputItem())}, `
  output += `fuel: ${itemToString(furnace.fuelItem())}, `
  output += `output: ${itemToString(furnace.outputItem())}`
  bot.chat(output)

  furnace.on('updateSlot', (slot, oldItem, newItem) => {
    bot.chat(`furnace update: ${itemToString(oldItem)} -> ${itemToString(newItem)} (slot: ${slot})`)
  })
  furnace.on('close', () => {
    bot.chat('furnace closed')
  })
  furnace.on('update', () => {
    console.log(`fuel: ${Math.round(furnace.fuel * 100)}% progress: ${Math.round(furnace.progress * 100)}%`)
  })

  bot.on('chat', onChat)

  function onChat (username, message) {
    if (username === bot.username) return
    const command = message.split(' ')
    switch (true) {
      case /^close$/.test(message):
        closeFurnace()
        break
      case /^(input|fuel) \d+ \w+$/.test(message):
        // input amount name
        // ex: input 32 coal
        putInFurnace(command[0], command[2], command[1])
        break
      case /^take (input|fuel|output)$/.test(message):
        // take what
        // ex: take output
        takeFromFurnace(command[0])
        break
    }

    function closeFurnace () {
      furnace.close()
      bot.removeListener('chat', onChat)
    }

    async function putInFurnace (where, name, amount) {
      const item = itemByName(furnace.items(), name)
      if (item) {
        const fn = {
          input: furnace.putInput,
          fuel: furnace.putFuel
        }[where]
        try {
          await fn.call(furnace, item.type, null, amount)
          bot.chat(`put ${amount} ${item.name}`)
        } catch (err) {
          bot.chat(`unable to put ${amount} ${item.name}`)
        }
      } else {
        bot.chat(`unknown item ${name}`)
      }
    }

    async function takeFromFurnace (what) {
      const fn = {
        input: furnace.takeInput,
        fuel: furnace.takeFuel,
        output: furnace.takeOutput
      }[what]
      try {
        const item = await fn.call(furnace)
        bot.chat(`took ${item.name}`)
      } catch (err) {
        bot.chat('unable to take')
      }
    }
  }
}

async function watchEnchantmentTable () {
  const enchantTableBlock = bot.findBlock({
    matching: ['enchanting_table'].map(name => bot.registry.blocksByName[name].id),
    maxDistance: 6
  })
  if (!enchantTableBlock) {
    bot.chat('no enchantment table found')
    return
  }
  const table = await bot.openEnchantmentTable(enchantTableBlock)
  bot.chat(itemToString(table.targetItem()))

  table.on('updateSlot', (slot, oldItem, newItem) => {
    bot.chat(`enchantment table update: ${itemToString(oldItem)} -> ${itemToString(newItem)} (slot: ${slot})`)
  })
  table.on('close', () => {
    bot.chat('enchantment table closed')
  })
  table.on('ready', () => {
    bot.chat(`ready to enchant. choices are ${table.enchantments.map(o => o.level).join(', ')}`)
  })

  bot.on('chat', onChat)

  function onChat (username, message) {
    if (username === bot.username) return
    const command = message.split(' ')
    switch (true) {
      case /^close$/.test(message):
        closeEnchantmentTable()
        break
      case /^put \w+$/.test(message):
        // put name
        // ex: put diamondsword
        putItem(command[1])
        break
      case /^add lapis$/.test(message):
        addLapis()
        break
      case /^enchant \d+$/.test(message):
        // enchant choice
        // ex: enchant 2
        enchantItem(command[1])
        break
      case /^take$/.test(message):
        takeEnchantedItem()
        break
    }

    function closeEnchantmentTable () {
      table.close()
    }

    async function putItem (name) {
      const item = itemByName(table.window.items(), name)
      if (item) {
        try {
          await table.putTargetItem(item)
          bot.chat(`I put ${itemToString(item)}`)
        } catch (err) {
          bot.chat(`error putting ${itemToString(item)}`)
        }
      } else {
        bot.chat(`unknown item ${name}`)
      }
    }

    async function addLapis () {
      const item = itemByType(table.window.items(), ['dye', 'purple_dye', 'lapis_lazuli'].filter(name => bot.registry.itemByName[name] !== undefined)
        .map(name => bot.registry.itemByName[name].id))
      if (item) {
        try {
          await table.putLapis(item)
          bot.chat(`I put ${itemToString(item)}`)
        } catch (err) {
          bot.chat(`error putting ${itemToString(item)}`)
        }
      } else {
        bot.chat("I don't have any lapis")
      }
    }

    async function enchantItem (choice) {
      choice = parseInt(choice, 10)
      try {
        const item = await table.enchant(choice)
        bot.chat(`enchanted ${itemToString(item)}`)
      } catch (err) {
        bot.chat('error enchanting')
      }
    }

    async function takeEnchantedItem () {
      try {
        const item = await table.takeTargetItem()
        bot.chat(`got ${itemToString(item)}`)
      } catch (err) {
        bot.chat('error getting item')
      }
    }
  }
}

function useInvsee (username, showEquipment) {
  bot.once('windowOpen', (window) => {
    const count = window.containerItems().length
    const what = showEquipment ? 'equipment' : 'inventory items'
    if (count) {
      bot.chat(`${username}'s ${what}:`)
      sayItems(window.containerItems())
    } else {
      bot.chat(`${username} has no ${what}`)
    }
  })
  if (showEquipment) {
    // any extra parameter triggers the easter egg
    // and shows the other player's equipment
    bot.chat(`/invsee ${username} 1`)
  } else {
    bot.chat(`/invsee ${username}`)
  }
}

function itemToString (item) {
  if (item) {
    return `${item.name} x ${item.count}`
  } else {
    return '(nothing)'
  }
}

function itemByType (items, type) {
  let item
  let i
  for (i = 0; i < items.length; ++i) {
    item = items[i]
    if (item && item.type === type) return item
  }
  return null
}

function itemByName (items, name) {
  let item
  let i
  for (i = 0; i < items.length; ++i) {
    item = items[i]
    if (item && item.name === name) return item
  }
  return null
}
