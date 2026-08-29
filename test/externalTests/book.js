const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)
  const usesComponents = bot.supportFeature('itemsWithComponents')

  const pages = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  ].map(page => page
    .split(' ')
    .map((word, i) => `§${(i % 13 + 1).toString(16)}${i % 2 ? '§l' : ''}${word}`)
    .join(' '))

  await bot.test.setInventorySlot(30, new Item(bot.registry.itemsByName.writable_book.id, 1, 0))

  await bot.writeBook(30, pages)
  let book = bot.inventory.slots[30]
  if (usesComponents) {
    const content = book.componentMap.get('writable_book_content').data
    assert.deepStrictEqual(content.pages.map(page => page.content), pages)
  } else {
    assert.deepStrictEqual(book.nbt.value.pages.value.value, pages)
  }

  await bot.signBook(30, pages, bot.username, 'My Very First Book')
  book = bot.inventory.slots[30]
  assert.strictEqual(book.type, bot.registry.itemsByName.written_book.id)
  if (usesComponents) {
    const content = book.componentMap.get('written_book_content').data
    assert.strictEqual(content.author, bot.username)
    assert.strictEqual(content.rawTitle, 'My Very First Book')
    assert.deepStrictEqual(content.pages.map(page => page.content.value), pages)
  } else {
    assert.strictEqual(book.nbt.value.author.value, bot.username)
    assert.strictEqual(book.nbt.value.title.value, 'My Very First Book')
  }
}
