/*
 * Even bots want to trade sometimes.
 *
 * That's why we created an example that demonstrates how easy it is
 * to find a villager and trade.
 *
 * You can ask the bot to trade with a villager, display the villagers in range
 * and show what trades a villager has by sending a chat message.
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node trader.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}
console.log('Commands :\n' +
  '  show villagers\n' +
  '  show inventory\n' +
  '  show trades <id>\n' +
  '  trade <id> <trade> [<times>]')

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'trader',
  password: process.argv[5],
  verbose: true
})
let mcdata
bot.once('inject_allowed', () => {
  mcdata = require('minecraft-data')(bot.version)
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  const command = message.split(' ')
  switch (true) {
    case message === 'show villagers':
      showVillagers()
      break
    case message === 'show inventory':
      showInventory()
      break
    case /^show trades [0-9]+$/.test(message):
      showTrades(command[2])
      break
    case /^trade [0-9]+ [0-9]+( [0-9]+)?$/.test(message):
      trade(command[1], command[2], command[3])
      break
  }
})

function showVillagers () {
  const villagers = Object.keys(bot.entities).map(id => bot.entities[id]).filter(e => e.entityType === 120)
  const closeVillagersId = villagers.filter(e => bot.entity.position.distanceTo(e.position) < 3).map(e => e.id)
  bot.chat(`found ${villagers.length} villagers`)
  bot.chat(`villager(s) you can trade with: ${closeVillagersId.join(', ')}`)
}

function showInventory () {
  bot.inventory.slots
    .filter(item => item).forEach((item) => {
      bot.chat(stringifyItem(item))
    })
}

function showTrades (id) {
  const e = bot.entities[id]
  switch (true) {
    case !e:
      bot.chat(`cant find entity with id ${id}`)
      break
    case e.entityType !== 120:
      bot.chat('entity is not a villager')
      break
    case bot.entity.position.distanceTo(e.position) > 3:
      bot.chat('villager out of reach')
      break
    default:
      const villager = bot.openVillager(e)
      villager.once('ready', () => {
        villager.close()
        stringifyTrades(villager.trades).forEach((trade, i) => {
          bot.chat(`${i + 1}: ${trade}`)
        })
      })
  }
}

function trade (id, index, count) {
  const e = bot.entities[id]
  switch (true) {
    case !e:
      bot.chat(`cant find entity with id ${id}`)
      break
    case e.entityType !== 120:
      bot.chat('entity is not a villager')
      break
    case bot.entity.position.distanceTo(e.position) > 3:
      bot.chat('villager out of reach')
      break
    default:
      const villager = bot.openVillager(e)
      villager.once('ready', () => {
        const trade = villager.trades[index - 1]
        count = count || trade.maxTradeuses - trade.tooluses
        switch (true) {
          case !trade:
            villager.close()
            bot.chat('trade not found')
            break
          case trade.disabled:
            villager.close()
            bot.chat('trade is disabled')
            break
          case trade.maxTradeuses - trade.tooluses < count:
            villager.close()
            bot.chat('cant trade that often')
            break
          case !hasResources(villager.window, trade, count):
            villager.close()
            bot.chat('dont have the resources to do that trade')
            break
          default:
            bot.chat('starting to trade')
            bot.trade(villager, index - 1, count, (err) => {
              villager.close()
              if (err) {
                bot.chat('an error acured while tyring to trade')
                console.log(err)
              } else {
                bot.chat(`traded ${count} times`)
              }
            })
        }
      })
  }

  function hasResources (window, trade, count) {
    const first = enough(trade.firstInput, count)
    const second = !trade.hasSecondItem || enough(trade.secondaryInput, count)
    return first && second

    function enough (item, count) {
      return window.count(item.type, item.metadata) >= item.count * count
    }
  }
}

function stringifyTrades (trades) {
  return trades.map((trade) => {
    let text = stringifyItem(trade.firstInput)
    if (trade.secondaryInput) text += ` & ${stringifyItem(trade.secondaryInput)}`
    if (trade.disabled) text += ' x '; else text += ' » '
    text += stringifyItem(trade.output)
    return `(${trade.tooluses}/${trade.maxTradeuses}) ${text}`
  })
}

function stringifyItem (item) {
  if (!item) return 'nothing'
  let text = `${item.count} ${item.displayName}`
  if (item.nbt && item.nbt.value) {
    const ench = item.nbt.value.ench
    const StoredEnchantments = item.nbt.value.StoredEnchantments
    const Potion = item.nbt.value.Potion
    const display = item.nbt.value.display

    if (Potion) text += ` of ${Potion.value.replace(/_/g, ' ').split(':')[1] || 'unknow type'}`
    if (display) text += ` named ${display.value.Name.value}`
    if (ench || StoredEnchantments) {
      text += ` enchanted with ${(ench || StoredEnchantments).value.value.map((e) => {
        const lvl = e.lvl.value
        const id = e.id.value
        return mcdata.enchantments[id].displayName + ' ' + lvl
      }).join(' ')}`
    }
  }
  return text
}
