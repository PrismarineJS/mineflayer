const Villager = require('../villager')
const assert = require('assert')

module.exports = inject

function noop (err) {
  if (err) throw err
}

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
      // This is actually not used:
      // bot._client.write('select_trade', {slot: choice})
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

  function openVillager (villagerEntity, cb = noop) {
    const villagerType = mcData.entitiesByName.villager ? mcData.entitiesByName.villager.id : mcData.entitiesByName.Villager.id
    assert.strictEqual(villagerEntity.entityType, villagerType)
    let ready = false

    bot._client.on(tradeListPacket, gotTrades)
    const villager = bot.openEntity(villagerEntity, Villager)
    villager.trades = null
    villager.once('ready', () => {
      cb(null, villager)
    })

    villager.once('close', () => {
      bot._client.removeListener(tradeListPacket, gotTrades)
    })

    return villager

    function gotTrades (packet) {
      if (!villager.window) return
      if (packet.windowId !== villager.window.id) return
      assert.ok(packet.trades)
      villager.trades = packet.trades.map(trade => Object.assign(trade, {
        inputItem1: Item.fromNotch(trade.inputItem1 || { blockId: -1 }),
        inputItem2: Item.fromNotch(trade.inputItem2 || { blockId: -1 }),
        outputItem: Item.fromNotch(trade.outputItem || { blockId: -1 })
      }))
      if (!ready) {
        ready = true
        villager.emit('ready')
      }
    }
  }

  function trade (villager, index, count, cb = noop) {
    const choice = parseInt(index, 10) // allow string argument
    assert.notStrictEqual(villager.trades, null)
    assert.notStrictEqual(villager.trades[choice], null)
    const Trade = villager.trades[choice]
    count = count || Trade.maximumNbTradeUses - Trade.nbTradeUses
    assert.ok(Trade.maximumNbTradeUses - Trade.nbTradeUses > 0, 'trade blocked')
    assert.ok(Trade.maximumNbTradeUses - Trade.nbTradeUses >= count)

    selectTrade(choice)

    next()

    function next () {
      if (count === 0) {
        if (Trade.maximumNbTradeUses - Trade.nbTradeUses === 0) {
          Trade.tradeDisabled = true
        }
        cb()
      } else {
        count--
        putRequirements(villager.window, Trade, (err) => {
          if (err) {
            cb(err)
          } else {
            villager.window.updateSlot(2, Object.assign({}, Trade.outputItem))
            bot.putAway(2, (err) => {
              if (err) {
                cb(err)
              } else {
                villager.window.updateSlot(0, null)
                villager.window.updateSlot(1, null)
                Trade.nbTradeUses++
                next()
              }
            })
          }
        })
      }
    }
  }

  function putRequirements (window, Trade, cb) {
    deposit(window, Trade.inputItem1.type, Trade.inputItem1.metadata, Trade.inputItem1.count, 0, (err) => {
      if (err) {
        cb(err)
      } else if (Trade.hasItem2) {
        deposit(window, Trade.inputItem2.type, Trade.inputItem2.metadata, Trade.inputItem2.count, 1, (err) => {
          if (err) {
            cb(err)
          } else {
            cb()
          }
        })
      } else {
        cb()
      }
    })
  }

  function deposit (window, itemType, metadata, count, slot, cb) {
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
    bot.transfer(options, cb)
  }

  bot.openVillager = openVillager
  bot.trade = trade
}
