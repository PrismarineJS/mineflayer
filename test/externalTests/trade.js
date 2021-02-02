const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  const villagerType = mcData.entitiesByName.villager ? 'villager' : 'Villager'

  const summonCommand = bot.supportFeature('indexesVillagerRecipes')
    ? `/summon ${villagerType} ~ ~1 ~ {NoAI:1, Offers:{Recipes:[0:{maxUses:7,buy:{id:"minecraft:emerald",Count:2},sell:{id:"minecraft:wheat",Count:2}, uses:1}]}}`
    : `/summon ${villagerType} ~ ~1 ~ {NoAI:1, Offers:{Recipes:[{maxUses:7,buy:{id:"minecraft:emerald",Count:2},sell:{id:"minecraft:wheat",Count:2}, uses:1}]}}`

  const commandBlockPos = bot.entity.position.offset(0.5, 0, 0.5)
  const redstoneBlockPos = commandBlockPos.offset(1, 0, 0)

  await bot.test.setInventorySlot(36, new Item(mcData.itemsByName.emerald.id, 64, 0))

  // A command block is needed to spawn the villager due to the chat's character limit in some versions
  bot.test.sayEverywhere(`/setblock ${commandBlockPos.toArray().join(' ')} command_block`)
  await bot.test.wait(500)
  bot.setCommandBlock(commandBlockPos, summonCommand)
  bot.test.sayEverywhere(`/setblock ${redstoneBlockPos.toArray().join(' ')} redstone_block`) // Activate the command block

  const [entity] = await once(bot, 'entitySpawn')
  assert(entity.name === villagerType)

  const villager = await bot.openVillager(entity)
  const trade = villager.trades[0]
  const sell = trade.inputItem1
  const buy = trade.outputItem

  assert.notStrictEqual(sell, null)
  assert.notStrictEqual(buy, null)
  assert.strictEqual(trade.nbTradeUses, 1)
  assert.strictEqual(trade.maximumNbTradeUses, 7)
  assert.strictEqual(trade.tradeDisabled, false)
  assert(trade.inputItem2 === null || (trade.inputItem2.type === undefined && trade.inputItem2.count === undefined)) // In some versions it returns null in others it returns an empty Item instance
  assert.strictEqual(sell.name, 'emerald')
  assert.strictEqual(sell.count, 2)
  assert.strictEqual(buy.name, 'wheat')
  assert.strictEqual(buy.count, 2)

  bot.test.sayEverywhere(`I have ${bot.currentWindow.count(mcData.itemsByName.emerald.id)} emeralds`)
  bot.test.sayEverywhere(`I can trade ${sell.count}x ${sell.displayName} for ${buy.count}x ${buy.displayName}`)

  await bot.trade(villager, 0, 6)
  assert.strictEqual(bot.currentWindow.count(mcData.itemsByName.emerald.id), 64 - 12)
  assert.strictEqual(bot.currentWindow.count(mcData.itemsByName.wheat.id), 12)

  assert.rejects(bot.trade(villager, 0, 1)) // Shouldn't be able, the trade is blocked!

  villager.close()
  bot.test.sayEverywhere(`/kill @e[type=${villagerType}]`)
}
