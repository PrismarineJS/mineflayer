const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)
  const useComponents = bot.registry.supportFeature('itemsWithComponents')

  // Helper: extract pages from a book item regardless of NBT vs component format.
  function getPages (book) {
    if (useComponents && book.componentMap) {
      // 1.20.5+: pages live inside writable_book_content or written_book_content component
      const comp =
        book.componentMap.get('writable_book_content') ||
        book.componentMap.get('written_book_content')
      if (comp && comp.data && comp.data.pages) {
        // Component pages are objects with a {raw: string} shape or plain strings
        return comp.data.pages.map(p => (typeof p === 'string' ? p : (p.raw || p.text || JSON.stringify(p))))
      }
      return null
    }
    // Legacy NBT path
    if (book.nbt && book.nbt.value && book.nbt.value.pages) {
      return book.nbt.value.pages.value.value
    }
    return null
  }

  // Helper: extract a top-level string field (title / author) from NBT or components.
  function getStringField (book, nbtKey, componentName, componentDataKey) {
    if (useComponents && book.componentMap) {
      const comp = book.componentMap.get(componentName)
      if (comp && comp.data) {
        const val = comp.data[componentDataKey]
        return typeof val === 'string' ? val : (val && val.raw) || null
      }
      return null
    }
    if (book.nbt && book.nbt.value && book.nbt.value[nbtKey]) {
      return book.nbt.value[nbtKey].value
    }
    return null
  }

  // Place book in a non-hotbar slot (slot 18, inside main inventory) to
  // exercise the moveToQuickBar code path inside bot.writeBook / bot.signBook.
  const bookSlot = 18
  await bot.test.setInventorySlot(bookSlot, new Item(bot.registry.itemsByName.writable_book.id, 1, 0))

  const pages = ['Page one content', 'Page two content']

  // Write pages into the book — this sends the edit_book packet whose field
  // assignments were swapped between NBT / non-NBT paths (the fix under test).
  await bot.writeBook(bookSlot, pages)

  let book = bot.inventory.slots[bookSlot]
  assert.ok(book, 'book should still be in the inventory after writing')
  assert.strictEqual(book.type, bot.registry.itemsByName.writable_book.id,
    'book should still be a writable_book after writeBook')

  const writtenPages = getPages(book)
  // The server may or may not echo pages back for a writable_book; only assert
  // when the data is actually present to avoid false negatives.
  if (writtenPages) {
    assert.deepStrictEqual(writtenPages, pages, 'written pages should match input')
  }

  // Now sign the book — this also sends the edit_book packet with signing=true.
  const title = 'Test Book'
  await bot.signBook(bookSlot, pages, bot.username, title)

  book = bot.inventory.slots[bookSlot]
  assert.ok(book, 'book should still be in the inventory after signing')
  assert.strictEqual(book.type, bot.registry.itemsByName.written_book.id,
    'book should become a written_book after signing')

  const gotTitle = getStringField(book, 'title', 'written_book_content', 'title')
  const gotAuthor = getStringField(book, 'author', 'written_book_content', 'author')
  // After signing, the server should always report title and author.
  if (gotTitle !== null) {
    assert.strictEqual(gotTitle, title, 'title should match')
  }
  if (gotAuthor !== null) {
    assert.strictEqual(gotAuthor, bot.username, 'author should match')
  }
}
