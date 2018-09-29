const Villager = require('../villager')
const assert = require('assert')

module.exports = inject

function noop (err) {
  if (err) throw err
}

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)
  const windows = require('prismarine-windows')(version).windows

  bot._client.registerChannel('MC|TrSel', 'i32')
  bot._client.registerChannel('MC|TrList', [
    'container',
    [
      { 'type': 'i32', 'name': 'windowId' },
      {
        'name': 'trades',
        'type': [
          'array',
          {
            'countType': 'i8',
            'type': [
              'container',
              [
                { 'type': 'slot', 'name': 'firstInput' },
                { 'type': 'slot', 'name': 'output' },
                { 'type': 'bool', 'name': 'hasSecondItem' },
                {
                  'name': 'secondaryInput',
                  'type': [
                    'switch',
                    {
                      'compareTo': 'hasSecondItem',
                      'fields': {
                        'true': 'slot',
                        'false': 'void'
                      }
                    }
                  ]
                },
                { 'type': 'bool', 'name': 'disabled' },
                { 'type': 'i32', 'name': 'tooluses' },
                { 'type': 'i32', 'name': 'maxTradeuses' }
              ]
            ]
          }]
      }
    ]
  ])

  function openVillager (villagerEntity) {
    assert.strictEqual(villagerEntity.entityType, 120)
    let ready = false
    const villager = bot.openEntity(villagerEntity, Villager)
    villager.trades = null

    bot._client.on('MC|TrList', gotTrades)
    villager.once('close', () => {
      bot._client.removeListener('MC|TrList', gotTrades)
    })

    return villager

    function gotTrades (packet) {
      if (!villager.window) return
      if (packet.windowId !== villager.window.id) return
      assert.ok(packet.trades)
      villager.trades = packet.trades.map(trade => Object.assign(trade, {
        firstInput: Item.fromNotch(trade.firstInput || { blockId: -1 }),
        secondaryInput: Item.fromNotch(trade.secondaryInput || {
          blockId: -1
        }),
        output: Item.fromNotch(trade.output || { blockId: -1 })
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
    count = count || Trade.maxTradeuses - Trade.tooluses
    assert.ok(Trade.maxTradeuses - Trade.tooluses > 0, 'trade blocked')
    assert.ok(Trade.maxTradeuses - Trade.tooluses >= count)

    bot._client.writeChannel('MC|TrSel', choice)

    next()

    function next () {
      if (count === 0) {
        if (Trade.maxTradeuses - Trade.tooluses === 0) {
          Trade.disabled = true
        }
        cb()
      } else {
        count--
        putRequirements(villager.window, Trade, (err) => {
          if (err) {
            cb(err)
          } else {
            villager.window.updateSlot(2, Object.assign({}, Trade.output))
            bot.putAway(2, (err) => {
              if (err) {
                cb(err)
              } else {
                villager.window.updateSlot(0, null)
                villager.window.updateSlot(1, null)
                Trade.tooluses++
                next()
              }
            })
          }
        })
      }
    }
  }

  function putRequirements (window, Trade, cb) {
    deposit(window, Trade.firstInput.type, Trade.firstInput.metadata, Trade.firstInput.count, 0, (err) => {
      if (err) {
        cb(err)
      } else if (Trade.hasSecondItem) {
        deposit(window, Trade.secondaryInput.type, Trade.secondaryInput.metadata, Trade.secondaryInput.count, 1, (err) => {
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
      sourceStart: window.inventorySlotStart,
      sourceEnd: window.inventorySlotStart + windows.INVENTORY_SLOT_COUNT,
      destStart: slot,
      destEnd: slot + 1
    }
    bot.transfer(options, cb)
  }

  bot.openVillager = openVillager
  bot.trade = trade
}
