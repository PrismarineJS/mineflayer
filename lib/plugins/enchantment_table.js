const EnchantmentTable = require('../enchantment_table')
const assert = require('assert')

module.exports = inject

function noop (err) {
  if (err) throw err
}

function inject (bot, { version }) {
  function openEnchantmentTable (enchantmentTableBlock) {
    assert.strictEqual(enchantmentTableBlock.type, 116)
    let ready = false
    const enchantmentTable = bot.openBlock(enchantmentTableBlock, EnchantmentTable)
    resetEnchantmentOptions()
    bot._client.on('craft_progress_bar', onUpdateWindowProperty)
    enchantmentTable.on('updateSlot', onUpdateSlot)
    enchantmentTable.once('close', onClose)
    enchantmentTable.enchant = enchant
    enchantmentTable.takeTargetItem = takeTargetItem
    enchantmentTable.putTargetItem = putTargetItem
    enchantmentTable.putLapis = putLapis
    return enchantmentTable
    function onClose () {
      bot._client.removeListener('craft_progress_bar', onUpdateWindowProperty)
    }

    function onUpdateWindowProperty (packet) {
      if (!enchantmentTable.window) return
      if (packet.windowId !== enchantmentTable.window.id) return
      assert.ok(packet.property >= 0)
      if (packet.property >= 3) return
      const arr = enchantmentTable.enchantments
      arr[packet.property].level = packet.value
      if (arr[0].level && arr[1].level && arr[2].level && !ready) {
        ready = true
        enchantmentTable.emit('ready')
      }
    }

    function onUpdateSlot (oldItem, newItem) {
      resetEnchantmentOptions()
    }

    function resetEnchantmentOptions () {
      enchantmentTable.enchantments = [{
        level: null
      }, { level: null }, {
        level: null
      }]
      ready = false
    }

    function enchant (choice, cb) {
      choice = parseInt(choice, 10) // allow string argument
      cb = cb || noop
      assert.notStrictEqual(enchantmentTable.enchantments[choice].level, null)
      bot._client.write('enchant_item', {
        windowId: enchantmentTable.window.id,
        enchantment: choice
      })
      enchantmentTable.once('updateSlot', (oldItem, newItem) => {
        cb(null, newItem)
      })
    }

    function takeTargetItem (cb = noop) {
      const item = enchantmentTable.targetItem()
      assert.ok(item)
      bot.putAway(item.slot, (err) => {
        cb(err, item)
      })
    }

    function putTargetItem (item, cb = noop) {
      bot.moveSlotItem(item.slot, 0, cb)
    }

    function putLapis (item, cb = noop) {
      bot.moveSlotItem(item.slot, 1, cb)
    }
  }

  bot.openEnchantmentTable = openEnchantmentTable
}
