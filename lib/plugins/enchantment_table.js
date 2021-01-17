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

      const slots = enchantmentTable.enchantments

      if (packet.property < 3) {
        const slot = slots[packet.property]
        slot.level = packet.value
      } else if (packet.property === 3) {
        enchantmentTable.xpseed = packet.value
      } else if (packet.property < 7) {
        const slot = slots[packet.property - 4]
        slot.expected.id = packet.value
      } else if (packet.property < 10) {
        const slot = slots[packet.property - 7]
        slot.expected.level = packet.value
      }

      if (slots[0].level >= 0 && slots[1].level >= 0 && slots[2].level >= 0) {
        if (!ready) enchantmentTable.emit('ready')
        ready = true
      } else {
        ready = false
      }
    }

    function resetEnchantmentOptions () {
      enchantmentTable.xpseed = -1
      enchantmentTable.enchantments = []
      for (let slot = 0; slot < 3; slot++) {
        enchantmentTable.enchantments.push({
          level: -1,
          expected: {
            enchant: -1,
            level: -1
          }
        })
      }
      ready = false
    }

    async function enchant (choice) {
      choice = parseInt(choice, 10) // allow string argument
      assert.notStrictEqual(enchantmentTable.enchantments[choice].level, -1)
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
