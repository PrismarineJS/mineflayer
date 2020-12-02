const assert = require('assert')

module.exports = inject

function callbackify (f) {
  return function (...args) {
    const cb = args[f.length]
    return f(...args).then(r => { if (cb) { cb(null, r) } return r }, err => { if (cb) { cb(err) } else throw err })
  }
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

  async function write (slot, pages, author, title, signing) {
    assert.ok(slot >= 0 && slot <= 44, 'slot out of inventory range')
    const book = bot.inventory.slots[slot]
    assert.ok(book && book.type === mcData.itemsByName.writable_book.id, `no book found in slot ${slot}`)
    const quickBarSlot = bot.quickBarSlot

    if (slot < 36) {
      await bot.moveSlotItem(slot, 36)
      bot.setQuickBarSlot(0)
      const book = await modifyBook(36, pages, author, title, signing)
      return new Promise(resolve => {
        async function onSetInvSlot (oldItem, newItem) {
          if (newItem.slot !== slot) return
          bot.removeListener('setSlot:0', onSetInvSlot)
          bot.setQuickBarSlot(quickBarSlot)
          await bot.moveSlotItem(36, slot)
          resolve()
        }
        bot.on('setSlot:0', onSetInvSlot)
        editBook(book, signing)
      })
    } else {
      bot.setQuickBarSlot(slot - 36)
      const book = await modifyBook(slot, pages, author, title, signing)
      return new Promise(resolve => {
        function onSetInvSlot (oldItem, newItem) {
          if (newItem.slot !== slot) return
          bot.removeListener('setSlot:0', onSetInvSlot)
          bot.setQuickBarSlot(quickBarSlot)
          resolve()
        }
        bot.on('setSlot:0', onSetInvSlot)
        editBook(book, signing)
      })
    }
  }

  async function modifyBook (slot, pages, author, title, signing) {
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
    return new Promise(resolve => {
      function onUpdate (updatedSlot) {
        if (updatedSlot === slot) {
          bot.inventory.removeListener('windowUpdate', onUpdate)
          resolve(book)
        }
      }

      bot.inventory.on('windowUpdate', onUpdate)
      bot.inventory.updateSlot(slot, book)
    })
  }

  bot.writeBook = callbackify(async (slot, pages) => {
    await write(slot, pages, null, null, false)
  })

  bot.signBook = callbackify(async (slot, pages, author, title) => {
    await write(slot, pages, author, title, true)
  })
}
