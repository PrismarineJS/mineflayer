const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  const maxUses = 3
  const trades = maxUses - 1 // each trade starts with one use spent

  const villagerType = bot.registry.entitiesByName.villager ? 'villager' : 'Villager'
  const testFluctuations = bot.supportFeature('selectingTradeMovesItems')
  // Item stacks are components on 1.20.5+; the NBT-era key is silently ignored.
  const countKey = bot.registry.version['>=']('1.20.5') ? 'count' : 'Count'

  const summonCommand = bot.supportFeature('indexesVillagerRecipes')
    ? `/summon ${villagerType} ~ ~1 ~ {NoAI:1, Offers:{Recipes:[0:{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:2},sell:{id:"minecraft:pumpkin_pie",${countKey}:2},uses: 1},1:{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:2},buyB:{id:"minecraft:pumpkin_pie",${countKey}:2},sell:{id:"minecraft:wheat",${countKey}:2}, uses:1},2:{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:1},sell:{id:"minecraft:glass",${countKey}:4},uses: 1},3:{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:36},buyB:{id:"minecraft:book",${countKey}:1},sell:{id:"minecraft:wooden_sword",${countKey}:1},uses: 1}]}}`
    : `/summon ${villagerType} ~ ~1 ~ {NoAI:1, Offers:{Recipes:[{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:2},sell:{id:"minecraft:pumpkin_pie",${countKey}:2},${testFluctuations ? 'demand:60,priceMultiplier:0.05f,specialPrice:-4,' : ''}uses: 1},{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:2},buyB:{id:"minecraft:pumpkin_pie",${countKey}:2},sell:{id:"minecraft:wheat",${countKey}:2}, uses:1},{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:1},sell:{id:"minecraft:glass",${countKey}:4},uses: 1},{maxUses:${maxUses},buy:{id:"minecraft:emerald",${countKey}:36},buyB:{id:"minecraft:book",${countKey}:1},sell:{id:"minecraft:wooden_sword",${countKey}:1},uses: 1}]}}`

  const commandBlockPos = bot.entity.position.offset(0.5, 0, 0.5)
  const redstoneBlockPos = commandBlockPos.offset(1, 0, 0)

  // One stack per deposit, in the order the trades consume them: transfer takes
  // the first matching stack, so every deposit is a single pick-up and place
  // instead of splitting a bigger stack one right click at a time.
  const emeraldPrice1 = testFluctuations ? 4 : 2
  const emeraldStacks = [emeraldPrice1, 2, 1, 36].flatMap(price => Array(trades).fill(price))
  const bookStacks = Array(trades).fill(1)
  let shouldHaveEmeralds = emeraldStacks.reduce((a, b) => a + b, 0)
  // Set the slots concurrently: on versions without a creative slot ack each set waits 400ms for a rejection.
  await Promise.all([
    ...emeraldStacks.map((count, i) => bot.test.setInventorySlot(9 + i, new Item(bot.registry.itemsByName.emerald.id, count, 0))),
    ...bookStacks.map((count, i) => bot.test.setInventorySlot(9 + emeraldStacks.length + i, new Item(bot.registry.itemsByName.book.id, count, 0)))
  ])

  // A command block is needed to spawn the villager due to the chat's character limit in some versions
  await bot.test.setBlock({ ...commandBlockPos, blockName: 'command_block' })
  // The server echoes the command block (an unchanged block_change) once the command is set
  const commandSet = once(bot.world, `blockUpdate:${commandBlockPos}`)
  bot.setCommandBlock(commandBlockPos, summonCommand)
  await commandSet
  bot.test.sayEverywhere(`/setblock ${redstoneBlockPos.toArray().join(' ')} redstone_block`) // Activate the command block

  const [entity] = await once(bot, 'entitySpawn')
  assert(entity.name === villagerType)

  const villager = await bot.openVillager(entity)
  console.log('Opened villager')
  // console.dir(villager, { depth: null })

  // Handle trade #1 -- takes 2x emerald and returns 2x pumpkin_pie
  {
    const trade = villager.trades[0]
    assert.strictEqual(trade.inputs.length, 1, 'Expected single input from villager on first trade')
    verifyTrade(trade)

    const [input] = trade.inputs
    assert.strictEqual(input.name, 'emerald')
    assert.strictEqual(input.count, 2)

    const [output] = trade.outputs
    assert.strictEqual(output.name, 'pumpkin_pie')
    assert.strictEqual(output.count, 2)

    await bot.trade(villager, 0, trades)
    shouldHaveEmeralds -= testFluctuations ? (2 * 2 * trades) : (2 * trades)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), shouldHaveEmeralds)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.pumpkin_pie.id), 2 * trades)
  }

  // Handle trade #2 -- takes [2x emerald, 2x pumpkin_pie] and returns 2x wheat
  {
    const trade = villager.trades[1]
    assert.strictEqual(trade.inputs.length, 2, 'Expected two inputs from villager on second trade')
    verifyTrade(trade)

    const [input1, input2] = trade.inputs
    assert.strictEqual(input1.name, 'emerald')
    assert.strictEqual(input1.count, 2)
    assert.strictEqual(input2.name, 'pumpkin_pie')
    assert.strictEqual(input2.count, 2)

    const [output] = trade.outputs
    assert.strictEqual(output.name, 'wheat')
    assert.strictEqual(output.count, 2)

    await bot.trade(villager, 1, trades)
    shouldHaveEmeralds -= trades * 2
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), shouldHaveEmeralds)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.pumpkin_pie.id), 0)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.wheat.id), 2 * trades)
  }

  // Handle trade #3 -- takes 1x emerald and returns 4x glass
  {
    const trade = villager.trades[2]
    assert.strictEqual(trade.inputs.length, 1, 'Expected single input from villager on first trade')
    verifyTrade(trade)

    const [input] = trade.inputs
    assert.strictEqual(input.name, 'emerald')
    assert.strictEqual(input.count, 1)

    const [output] = trade.outputs
    assert.strictEqual(output.name, 'glass')
    assert.strictEqual(output.count, 4)

    await bot.trade(villager, 2, trades)
    shouldHaveEmeralds -= trades
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), shouldHaveEmeralds)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.glass.id), 4 * trades)
  }

  // Handle trade #4 -- takes [36x emerald, 1x book] and returns 1x wooden sword
  {
    const trade = villager.trades[3]
    assert.strictEqual(trade.inputs.length, 2, 'Expected two inputs from villager on second trade')
    verifyTrade(trade)

    const [input1, input2] = trade.inputs
    assert.strictEqual(input1.name, 'emerald')
    assert.strictEqual(input1.count, 36)
    assert.strictEqual(input2.name, 'book')
    assert.strictEqual(input2.count, 1)

    const [output] = trade.outputs
    assert.strictEqual(output.name, 'wooden_sword')
    assert.strictEqual(output.count, 1)

    await bot.trade(villager, 3, trades)
    shouldHaveEmeralds -= trades * 36
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.emerald.id), shouldHaveEmeralds)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.book.id), 0)
    assert.strictEqual(bot.currentWindow.count(bot.registry.itemsByName.wooden_sword.id), trades)
  }

  function verifyTrade (trade) {
    assert.strictEqual(trade.nbTradeUses, 1)
    assert.strictEqual(trade.maximumNbTradeUses, maxUses)
    assert.strictEqual(trade.tradeDisabled, false)

    const printCountInv = function (item) {
      return `${bot.currentWindow.count(bot.registry.itemsByName[item.name].id)}x ${item.displayName}`
    }
    const printCountTrade = function (item) {
      return `${item.count}x ${item.displayName}`
    }

    bot.test.sayEverywhere(`I have ${printCountInv(trade.inputItem1)} ${trade.hasItem2 ? 'and ' + printCountInv(trade.inputItem2) : ''}`)
    bot.test.sayEverywhere(`I can trade ${printCountTrade(trade.inputItem1)} ${trade.hasItem2 ? 'and ' + printCountTrade(trade.inputItem2) : ''} for ${printCountTrade(trade.outputItem)}`)
  }

  assert.rejects(bot.trade(villager, 1, 1)) // Shouldn't be able, the trade is blocked!
  await villager.close()
  await bot.test.killEntity(entity)
}
