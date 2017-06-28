const assert = require('assert')

module.exports = inject

function noop (err) {
  if (err) throw err
}

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)
  bot._client.registerChannel('MC|BEdit', 'slot')

  function write (slot, pages, cb = noop) {
    assert.ok(slot >= 0 && slot <= 44, 'slot out of inventory range')
    const book = bot.inventory.slots[slot]
    assert.ok(book && book.type === 386, `no book found in slot ${slot}`)
    const quickBarSlot = bot.quickBarSlot

    if (slot < 36) {
      bot.moveSlotItem(slot, 36, (err) => {
        if (err) return cb(err)
        bot.setQuickBarSlot(0)
        modifyBook(36, pages, (book) => {
          bot._client.writeChannel('MC|BEdit', Item.toNotch(book))
          bot.setQuickBarSlot(quickBarSlot)
          bot.moveSlotItem(36, slot, cb)
        })
      })
    } else {
      bot.setQuickBarSlot(slot - 36)
      modifyBook(slot, pages, (book) => {
        bot._client.writeChannel('MC|BEdit', Item.toNotch(book))
        bot.setQuickBarSlot(quickBarSlot)
        cb()
      })
    }
  }

  function modifyBook (slot, pages, cb) {
    const book = Object.assign({}, bot.inventory.slots[slot])
    if (book.nbt.type !== 'compound') {
      book.nbt = {
        type: 'compound',
        name: '',
        value: {}
      }
    }
    book.nbt.value.pages = {
      type: 'list',
      value: {
        type: 'string',
        value: pages
      }
    }
    bot.inventory.on('windowUpdate', onUpdate)
    bot.inventory.updateSlot(slot, book)

    function onUpdate (updatedSlot) {
      if (updatedSlot === slot) {
        bot.inventory.removeListener('windowUpdate', onUpdate)
        cb(book)
      }
    }
  }

  bot.writeBook = write
}
