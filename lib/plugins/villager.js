const assert = require('assert')
const { once } = require('events')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  const mcData = require('minecraft-data')(version)
  const Item = require('prismarine-item')(version)

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
    const villagerType = mcData.entitiesByName.villager ? mcData.entitiesByName.villager.id : mcData.entitiesByName.Villager.id
    assert.strictEqual(villagerEntity.entityType, villagerType)
    let ready = false

    const villagerPromise = bot.openEntity(villagerEntity)
    bot._client.on(tradeListPacket, gotTrades)
    const villager = await villagerPromise
    if (villager.type !== 'minecraft:villager' && villager.type !== 'minecraft:merchant') {
      throw new Error('This is not a villager')
    }

    villager.trades = null

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
        Object.assign(trade, {
          inputItem1: Item.fromNotch(trade.inputItem1 || { blockId: -1 }),
          inputItem2: Item.fromNotch(trade.inputItem2 || { blockId: -1 }),
          outputItem: Item.fromNotch(trade.outputItem || { blockId: -1 })
        })
        if (trade.demand !== undefined && trade.specialPrice !== undefined) { // the price is affected by demand and reputation
          const demandDiff = Math.max(0, Math.floor(trade.inputItem1.count * trade.demand * trade.priceMultiplier))
          trade.realPrice = Math.min(Math.max((trade.inputItem1.count + trade.specialPrice + demandDiff), 1), trade.inputItem1.stackSize)
        } else {
          trade.realPrice = trade.inputItem1.count
        }
        trade.hasItem2 = !!(trade.inputItem2 && trade.inputItem2.type && trade.inputItem2.count)
        return trade
      })
      if (!ready) {
        ready = true
        villager.emit('ready')
        console.log('emit ready')
      }
    }
  }

  async function trade (villager, index, count) {
    const choice = parseInt(index, 10) // allow string argument
    assert.notStrictEqual(villager.trades, null)
    assert.notStrictEqual(villager.trades[choice], null)
    const Trade = villager.trades[choice]
    count = count || Trade.maximumNbTradeUses - Trade.nbTradeUses
    assert.ok(Trade.maximumNbTradeUses - Trade.nbTradeUses > 0, 'trade blocked')
    assert.ok(Trade.maximumNbTradeUses - Trade.nbTradeUses >= count)

    const itemCount1 = villager.count(Trade.inputItem1.type, Trade.inputItem1.metadata)
    const hasEnoughItem1 = itemCount1 >= Trade.realPrice * count
    let hasEnoughItem2 = true
    if (Trade.hasItem2) {
      const itemCount2 = villager.count(Trade.inputItem2.type, Trade.inputItem2.metadata)
      hasEnoughItem2 = itemCount2 >= Trade.inputItem2.count * count
    }
    if (!hasEnoughItem1 || !hasEnoughItem2) {
      throw new Error('Not enough items to trade')
    }

    selectTrade(choice)

    if (bot.supportFeature('selectingTradeMovesItems')) { // 1.14+ the server moves items around by itself after selecting a trade
      await new Promise((resolve, reject) => {
        const updatedSlots = {}
        function cb (slot) {
          updatedSlots[slot] = true
          if (updatedSlots[0] && updatedSlots[2] && (!Trade.hasItem2 || updatedSlots[1])) {
            clearTimeout(timeout)
            villager.removeListener('updateSlot', cb)
            resolve()
          }
        }
        villager.on('updateSlot', cb)
        const timeout = setTimeout(() => {
          clearTimeout(timeout)
          villager.removeListener('updateSlot', cb)
          reject(new Error('Timed out waiting for window updates'))
        }, 30000)
      })
    }
    for (let i = 0; i < count; i++) {
      await putRequirements(villager, Trade, count)
      villager.updateSlot(2, Object.assign({}, Trade.outputItem))
      await bot.putAway(2, true)
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
      Trade.nbTradeUses++
    }

    for (const i of [0, 1]) {
      if (villager.slots[i]) {
        await bot.putAway(i, true) // 1.14+ whole stacks of items will automatically be placed , so there might be some left over
      }
    }

    if (Trade.maximumNbTradeUses - Trade.nbTradeUses === 0) {
      Trade.tradeDisabled = true
    }
  }

  async function putRequirements (window, Trade, count) {
    const [slot1, slot2] = window.slots
    const { stackSize: stackSize1, type: type1, metadata: metadata1 } = Trade.inputItem1
    const tradeCount1 = Trade.realPrice
    const neededCount1 = Math.min(stackSize1, tradeCount1 * count)

    const input1 = !slot1
      ? neededCount1
      : (slot1.count < tradeCount1 ? neededCount1 - slot1.count : 0)
    await deposit(window, type1, metadata1, input1, 0)
    if (Trade.hasItem2) {
      const { count: tradeCount2, stackSize: stackSize2, type: type2, metadata: metadata2 } = Trade.inputItem2
      const needCount2 = Math.min(stackSize2, tradeCount2 * count)

      const input2 = !slot2
        ? needCount2
        : (slot2.count < tradeCount2 ? needCount2 - slot2.count : 0)
      await deposit(window, type2, metadata2, input2, 1)
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

  bot.openVillager = callbackify(openVillager)
  bot.trade = callbackify(trade)
}
