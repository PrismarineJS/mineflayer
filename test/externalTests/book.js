const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)

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
  book.nbt.value.pages.value.value.forEach((page, i) => assert.strictEqual(page, pages[i]))

  await bot.signBook(30, pages, bot.username, 'My Very First Book')
  book = bot.inventory.slots[30]
  assert.strictEqual(book.type, bot.registry.itemsByName.written_book.id)
  assert.strictEqual(book.nbt.value.author.value, bot.username)
  assert.strictEqual(book.nbt.value.title.value, 'My Very First Book')
}
