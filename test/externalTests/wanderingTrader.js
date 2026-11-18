const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  if (!bot.registry.entitiesByName.wandering_trader) {
    console.log(`wanderingTrader: skipped, ${bot.version} has no wandering trader (added in 1.14)`)
    return
  }

  const Item = require('prismarine-item')(bot.registry)
  const { itemsByName } = bot.registry

  // Item stacks are components on 1.20.5+; the NBT-era key is silently ignored.
  const countKey = bot.registry.version['>=']('1.20.5') ? 'count' : 'Count'
  const summonCommand = `/summon wandering_trader ~ ~1 ~ {NoAI:1, Offers:{Recipes:[{maxUses:3,buy:{id:"minecraft:emerald",${countKey}:1},sell:{id:"minecraft:glass",${countKey}:4},uses:0},{maxUses:3,buy:{id:"minecraft:emerald",${countKey}:2},buyB:{id:"minecraft:book",${countKey}:1},sell:{id:"minecraft:wheat",${countKey}:3},uses:1}]}}`

  // One stack per deposit, in the order the trades consume them
  const stacks = [
    ['emerald', 1], ['emerald', 1], ['emerald', 2], ['emerald', 2], ['book', 1], ['book', 1]
  ]
  await Promise.all(stacks.map(([name, count], i) => bot.test.setInventorySlot(9 + i, new Item(itemsByName[name].id, count, 0))))

  // The summon command is longer than a chat message, so a command block runs it
  const commandBlockPos = bot.entity.position.offset(0.5, 0, 0.5)
  const redstoneBlockPos = commandBlockPos.offset(1, 0, 0)
  await bot.test.setBlock({ ...commandBlockPos, blockName: 'command_block' })
  const commandSet = once(bot.world, `blockUpdate:${commandBlockPos}`)
  bot.setCommandBlock(commandBlockPos, summonCommand)
  await commandSet
  bot.test.sayEverywhere(`/setblock ${redstoneBlockPos.toArray().join(' ')} redstone_block`)

  const [entity] = await once(bot, 'entitySpawn')
  assert.strictEqual(entity.name, 'wandering_trader')

  const trader = await bot.openVillager(entity)
  assert.strictEqual(trader.type, 'minecraft:merchant')
  assert.strictEqual(trader.trades.length, 2)

  const [glass, wheat] = trader.trades
  assert.deepStrictEqual(glass.inputs.map(item => [item.name, item.count]), [['emerald', 1]])
  assert.deepStrictEqual(glass.outputs.map(item => [item.name, item.count]), [['glass', 4]])
  assert.strictEqual(glass.nbTradeUses, 0)
  assert.strictEqual(glass.maximumNbTradeUses, 3)
  assert.deepStrictEqual(wheat.inputs.map(item => [item.name, item.count]), [['emerald', 2], ['book', 1]])
  assert.deepStrictEqual(wheat.outputs.map(item => [item.name, item.count]), [['wheat', 3]])
  assert.strictEqual(wheat.nbTradeUses, 1)

  await bot.trade(trader, 0, 2)
  assert.strictEqual(trader.count(itemsByName.glass.id), 8)
  await trader.trade(1, 2)
  assert.strictEqual(trader.count(itemsByName.wheat.id), 6)
  assert.strictEqual(trader.count(itemsByName.emerald.id), 0)
  assert.strictEqual(trader.count(itemsByName.book.id), 0)
  // The second offer had one use left of three before the two trades
  await assert.rejects(bot.trade(trader, 1, 1))

  await trader.close()

  await assert.rejects(bot.openVillager(bot.entity), /Expected a villager or wandering trader, but got player/)
  await bot.test.killEntity(entity)
}
