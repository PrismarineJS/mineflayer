const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node book.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'book',
  password: process.argv[5]
})

const pages = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
].map(page => page
  .split(' ')
  .map((word, i) => `§${(i % 13 + 1).toString(16)}${i % 2 ? '§l' : ''}${word}`)
  .join(' '))

bot.once('login', () => console.log('logged in'))

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'print':
      print()
      break
    case 'write':
      write()
      break
    case 'toss':
      toss()
      break
  }
})

function toss () {
  const [book] = bot.inventory.items().filter(({ name }) => name === 'writable_book')
  bot.tossStack(book)
}

async function write () {
  const [book] = bot.inventory.items().filter(({ name }) => name === 'writable_book')
  if (!book) {
    bot.chat("I don't have a book.")
    return
  }
  await bot.writeBook(book.slot, pages)
  print()
}

function print () {
  const [book] = bot.inventory.items().filter(({ name }) => name === 'writable_book')
  book.nbt.value.pages.value.value.forEach((page, i) => bot.chat(`Page ${i + 1}: ${page.replace(/§[a-z0-9]/g, '')}`))
}
