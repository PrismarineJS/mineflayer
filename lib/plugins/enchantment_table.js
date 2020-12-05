const EnchantmentTable = require('../enchantment_table')
const assert = require('assert')
const { once } = require('events')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  function openEnchantmentTable (enchantmentTableBlock) {
    assert.strictEqual(enchantmentTableBlock.name, 'enchanting_table')
    let ready = false
    const enchantmentTable = bot.openBlock(enchantmentTableBlock, EnchantmentTable)
    resetEnchantmentOptions()
    bot._client.on('craft_progress_bar', onUpdateWindowProperty)
    enchantmentTable.on('updateSlot', onUpdateSlot)
    enchantmentTable.once('close', onClose)
    enchantmentTable.enchant = callbackify(enchant)
    enchantmentTable.takeTargetItem = callbackify(takeTargetItem)
    enchantmentTable.putTargetItem = callbackify(putTargetItem)
    enchantmentTable.putLapis = callbackify(putLapis)
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

    async function enchant (choice) {
      choice = parseInt(choice, 10) // allow string argument
      assert.notStrictEqual(enchantmentTable.enchantments[choice].level, null)
      bot._client.write('enchant_item', {
        windowId: enchantmentTable.window.id,
        enchantment: choice
      })
      const [, newItem] = await once(enchantmentTable, 'updateSlot')
      return newItem
    }

    async function takeTargetItem () {
      const item = enchantmentTable.targetItem()
      assert.ok(item)
      await bot.putAway(item.slot)
      return item
    }

    async function putTargetItem (item) {
      await bot.moveSlotItem(item.slot, 0)
    }

    async function putLapis (item) {
      await bot.moveSlotItem(item.slot, 1)
    }
  }

  bot.openEnchantmentTable = openEnchantmentTable
}
