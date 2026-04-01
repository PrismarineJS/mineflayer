const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

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
  const writtenPages = book.nbt.value.pages.value.value
  assert.deepStrictEqual(writtenPages, pages, 'written pages should match input')

  // Now sign the book — this also sends the edit_book packet with signing=true.
  const title = 'Test Book'
  await bot.signBook(bookSlot, pages, bot.username, title)

  book = bot.inventory.slots[bookSlot]
  assert.ok(book, 'book should still be in the inventory after signing')
  assert.strictEqual(book.type, bot.registry.itemsByName.written_book.id,
    'book should become a written_book after signing')
  assert.strictEqual(book.nbt.value.title.value, title, 'title should match')
  assert.strictEqual(book.nbt.value.author.value, bot.username, 'author should match')
}
