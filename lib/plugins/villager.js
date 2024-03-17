const assert = require('assert')
const { once } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  const { entitiesByName } = bot.registry
  const Item = require('prismarine-item')(bot.registry)

  let selectTrade
  if (bot.supportFeature('useMCTrSel')) {
    bot._client.registerChannel('MC|TrSel', 'i32')
    selectTrade = (choice) => {
      bot._client.writeChannel('MC|TrSel', choice)
    }
  } else {
    selectTrade = (choice) => {
      bot._client.write('select_trade', { slot: choice })
    }
  }

  const tradeListSchema = [
    'container',
    [
      { type: 'i32', name: 'windowId' },
      {
        name: 'trades',
        type: [
          'array',
          {
            countType: 'i8',
            type: [
              'container',
              [
                { type: 'slot', name: 'inputItem1' },
                { type: 'slot', name: 'outputItem' },
                { type: 'bool', name: 'hasItem2' },
                {
                  name: 'inputItem2',
                  type: [
                    'switch',
                    {
                      compareTo: 'hasItem2',
                      fields: {
                        true: 'slot',
                        false: 'void'
                      }
                    }
                  ]
                },
                { type: 'bool', name: 'tradeDisabled' },
                { type: 'i32', name: 'nbTradeUses' },
                { type: 'i32', name: 'maximumNbTradeUses' }
              ]
            ]
          }]
      }
    ]
  ]

  let tradeListPacket
  if (bot.supportFeature('useMCTrList')) {
    tradeListPacket = 'MC|TrList'
    bot._client.registerChannel('MC|TrList', tradeListSchema)
  } else if (bot.supportFeature('usetraderlist')) {
    tradeListPacket = 'minecraft:trader_list'
    bot._client.registerChannel('minecraft:trader_list', tradeListSchema)
  } else {
    tradeListPacket = 'trade_list'
  }

  async function openVillager (villagerEntity) {
    const villagerType = entitiesByName.villager ? entitiesByName.villager.id : entitiesByName.Villager.id
    assert.strictEqual(villagerEntity.entityType, villagerType)
    let ready = false

    const villagerPromise = bot.openEntity(villagerEntity)
    bot._client.on(tradeListPacket, gotTrades)
    const villager = await villagerPromise
    if (villager.type !== 'minecraft:villager' && villager.type !== 'minecraft:merchant') {
      throw new Error('Expected minecraft:villager or minecraft:mechant type, but got ' + villager.type)
    }

    villager.trades = null
    villager.selectedTrade = null

    villager.once('close', () => {
      bot._client.removeListener(tradeListPacket, gotTrades)
    })

    villager.trade = async (index, count) => {
      await bot.trade(villager, index, count)
    }

    if (!ready) await once(villager, 'ready')
    return villager

    async function gotTrades (packet) {
      const villager = await villagerPromise
      if (packet.windowId !== villager.id) return
      assert.ok(packet.trades)
      villager.trades = packet.trades.map(trade => {
        trade.inputs = [trade.inputItem1 = Item.fromNotch(trade.inputItem1 || { blockId: -1 })]
        if (trade.inputItem2?.itemCount != null) {
          trade.inputs.push(trade.inputItem2 = Item.fromNotch(trade.inputItem2 || { blockId: -1 }))
        }

        trade.hasItem2 = !!(trade.inputItem2 && trade.inputItem2.type && trade.inputItem2.count)
        trade.outputs = [trade.outputItem = Item.fromNotch(trade.outputItem || { blockId: -1 })]

        if (trade.demand !== undefined && trade.specialPrice !== undefined) { // the price is affected by demand and reputation
          const demandDiff = Math.max(0, Math.floor(trade.inputItem1.count * trade.demand * trade.priceMultiplier))
          trade.realPrice = Math.min(Math.max((trade.inputItem1.count + trade.specialPrice + demandDiff), 1), trade.inputItem1.stackSize)
        } else {
          trade.realPrice = trade.inputItem1.count
        }
        return trade
      })
      if (!ready) {
        ready = true
        villager.emit('ready')
      }
    }
  }

  async function trade (villager, index, count) {
    const choice = parseInt(index, 10) // allow string argument
    assert.notStrictEqual(villager.trades, null)
    assert.notStrictEqual(villager.trades[choice], null)
    const Trade = villager.trades[choice]
    villager.selectedTrade = Trade
    count = count || Trade.maximumNbTradeUses - Trade.nbTradeUses
    assert.ok(Trade.maximumNbTradeUses - Trade.nbTradeUses > 0, 'trade blocked')
    assert.ok(Trade.maximumNbTradeUses - Trade.nbTradeUses >= count)

    const itemCount1 = villager.count(Trade.inputItem1.type, Trade.inputItem1.metadata)
    const hasEnoughItem1 = itemCount1 >= Trade.realPrice * count
    let hasEnoughItem2 = true
    let itemCount2 = 0
    if (Trade.hasItem2) {
      itemCount2 = villager.count(Trade.inputItem2.type, Trade.inputItem2.metadata)
      hasEnoughItem2 = itemCount2 >= Trade.inputItem2.count * count
    }
    if (!hasEnoughItem1) {
      throw new Error('Not enough item 1 to trade')
    }
    if (!hasEnoughItem2) {
      throw new Error('Not enough item 2 to trade')
    }

    selectTrade(choice)
    if (bot.supportFeature('selectingTradeMovesItems')) { // 1.14+ the server moves items around by itself after selecting a trade
      const proms = []
      proms.push(once(villager, 'updateSlot:0'))
      if (Trade.hasItem2) proms.push(once(villager, 'updateSlot:1'))
      if (bot.supportFeature('setSlotAsTransaction')) {
        proms.push(once(villager, 'updateSlot:2'))
      }
      await Promise.all(proms)
    }

    for (let i = 0; i < count; i++) {
      await putRequirements(villager, Trade)
      // ToDo: See if this does anything kappa
      Trade.nbTradeUses++
      if (Trade.maximumNbTradeUses - Trade.nbTradeUses === 0) {
        Trade.tradeDisabled = true
      }
      if (!bot.supportFeature('setSlotAsTransaction')) {
        villager.updateSlot(2, Object.assign({}, Trade.outputItem))

        const [slot1, slot2] = villager.slots
        if (slot1) {
          assert.strictEqual(slot1.type, Trade.inputItem1.type)
          const updatedCount1 = slot1.count - Trade.realPrice
          const updatedSlot1 = updatedCount1 <= 0
            ? null
            : { ...slot1, count: updatedCount1 }
          villager.updateSlot(0, updatedSlot1)
        }

        if (slot2) {
          assert.strictEqual(slot2.type, Trade.inputItem2.type)
          const updatedCount2 = slot2.count - Trade.inputItem2.count
          const updatedSlot2 = updatedCount2 <= 0
            ? null
            : { ...slot2, count: updatedCount2 }
          villager.updateSlot(1, updatedSlot2)
        }
      }

      await bot.putAway(2)
    }

    for (const i of [0, 1]) {
      if (villager.slots[i]) {
        await bot.putAway(i) // 1.14+ whole stacks of items will automatically be placed , so there might be some left over
      }
    }
  }

  async function putRequirements (window, Trade) {
    const [slot1, slot2] = window.slots
    const { type: type1, metadata: metadata1 } = Trade.inputItem1

    const input1 = slot1
      ? Math.max(0, Trade.realPrice - slot1.count)
      : Trade.realPrice
    if (input1) {
      await deposit(window, type1, metadata1, input1, 0)
    }
    if (Trade.hasItem2) {
      const { count: tradeCount2, type: type2, metadata: metadata2 } = Trade.inputItem2

      const input2 = slot2
        ? Math.max(0, tradeCount2 - slot2.count)
        : tradeCount2
      if (input2) {
        await deposit(window, type2, metadata2, input2, 1)
      }
    }
  }

  async function deposit (window, itemType, metadata, count, slot) {
    const options = {
      window,
      itemType,
      metadata,
      count,
      sourceStart: window.inventoryStart,
      sourceEnd: window.inventoryEnd,
      destStart: slot,
      destEnd: slot + 1
    }
    await bot.transfer(options)
  }

  bot.openVillager = openVillager
  bot.trade = trade
}
