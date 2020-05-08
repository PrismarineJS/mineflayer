const assert = require('assert')

module.exports = inject

function noop (err) {
  if (err) throw err
}

function inject (bot, { version }) {
  const mcData = require('minecraft-data')(version)
  const Item = require('prismarine-item')(version)

  let editBook
  if (bot.supportFeature('editBookIsPluginChannel')) {
    bot._client.registerChannel('MC|BEdit', 'slot')
    bot._client.registerChannel('MC|BSign', 'slot')
    editBook = (book, signing = false) => {
      if (signing) bot._client.writeChannel('MC|BSign', Item.toNotch(book))
      else bot._client.writeChannel('MC|BEdit', Item.toNotch(book))
    }
  } else if (bot.supportFeature('hasEditBookPacket')) {
    editBook = (book, signing = false, hand = 0) => {
      bot._client.write('edit_book', {
        new_book: Item.toNotch(book),
        signing,
        hand
      })
    }
  }

  function write (slot, pages, author, title, signing, cb = noop) {
    assert.ok(slot >= 0 && slot <= 44, 'slot out of inventory range')
    const book = bot.inventory.slots[slot]
    assert.ok(book && book.type === mcData.itemsByName.writable_book.id, `no book found in slot ${slot}`)
    const quickBarSlot = bot.quickBarSlot

    if (slot < 36) {
      bot.moveSlotItem(slot, 36, (err) => {
        if (err) return cb(err)
        bot.setQuickBarSlot(0)
        modifyBook(36, pages, author, title, signing, (book) => {
          function onSetInvSlot (oldItem, newItem) {
            if (newItem.slot !== slot) return
            bot.removeListener('setSlot:0', onSetInvSlot)
            bot.setQuickBarSlot(quickBarSlot)
            bot.moveSlotItem(36, slot, cb)
            cb()
          }
          bot.on('setSlot:0', onSetInvSlot)
          editBook(book, signing)
        })
      })
    } else {
      bot.setQuickBarSlot(slot - 36)
      modifyBook(slot, pages, author, title, signing, (book) => {
        function onSetInvSlot (oldItem, newItem) {
          if (newItem.slot !== slot) return
          bot.removeListener('setSlot:0', onSetInvSlot)
          bot.setQuickBarSlot(quickBarSlot)
          cb()
        }
        bot.on('setSlot:0', onSetInvSlot)
        editBook(book, signing)
      })
    }
  }

  function modifyBook (slot, pages, author, title, signing, cb) {
    const book = Object.assign({}, bot.inventory.slots[slot])
    if (!book.nbt || book.nbt.type !== 'compound') {
      book.nbt = {
        type: 'compound',
        name: '',
        value: {}
      }
    }
    if (signing) {
      if (bot.supportFeature('clientUpdateBookIdWhenSign')) {
        book.type = mcData.itemsByName.written_book.id
      }
      book.nbt.value.author = {
        type: 'string',
        value: author
      }
      book.nbt.value.title = {
        type: 'string',
        value: title
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

  bot.writeBook = (slot, pages, cb = noop) => {
    write(slot, pages, null, null, false, cb)
  }

  bot.signBook = (slot, pages, author, title, cb = noop) => {
    write(slot, pages, author, title, true, cb)
  }
}
