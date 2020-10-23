import { createBot } from 'mineflayer'

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node multiple.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'multiple',
  password: process.argv[5]
})

let i = 0
function next () {
  if (i < 10) {
    i++
    setTimeout(() => {
      createBot(`mineflayer-bot${i}`)
      next()
    }, 100)
  }
}
next()
