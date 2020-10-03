/*
 * An example of how to make multiple bots connect to a server.
 */


const mineflayer = require('mineflayer')

if (process.argv.length < 3 || process.argv.length > 5) {
  console.log('Usage : node multiple.js <host> <port>')
  process.exit(1)
}

let i = 0
function next () {
  if (i < 10) {
    i++
    // create a new session after 100 miliseconds
    setTimeout(() => {
      createBot(`mineflayer-bot${i}`)
      next() // repeat
    }, 100)
  }
}
next()

// create a new connection to the server
function createBot (name) {
  mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: name
  })
}
