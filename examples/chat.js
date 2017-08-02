/*
 * This is a very simple chat client.
 *
 * That shows you how you can read and interact with any chat on a server
 *
 * Just type into the console and press enter to say something
 *
 * Be sure to stand somewhere save so you dont get killed by zombies :)
 */

const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node echo.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'echo',
  password: process.argv[5],
  verbose: true
})

// uses on 'message' instead of on 'chat'
// because on 'chat' does not work on all servers 
bot.on('message', (message) => {
  var strMessage = `${message}` // removes json
  console.log(strMessage)
})

// console input
var stdin = process.openStdin()
stdin.addListener('data', function(d) {
  // if something was typed in
  var input = d.toString().trim() // get input
  bot.chat(input) // tell everyone
})
