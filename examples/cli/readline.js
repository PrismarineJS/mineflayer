/*
 * This example is an easy way to connect mineflayer to the node:readline module
 * See: https://nodejs.org/api/readline.html
 * Using this, we can make a simple terminal-to-ingame-chat interface
 *
 * Made by Jovan04 01/24/2023
*/

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node readline.js <host> <port> [<name>] [<auth>]')
  process.exit(1)
}

const mineflayer = require('mineflayer') // load mineflayer library
const readline = require('node:readline') // load the node.js readline module

// bot options
const options = {
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] || 'readline',
  auth: process.argv[5] || 'offline'
}

const bot = mineflayer.createBot(options) // join the minecraft server

const rl = readline.createInterface({ // creates our readline interface with our console as input and output
  input: process.stdin,
  output: process.stdout
})

bot.once('spawn', () => {
  console.log(`Bot joined the game with username ${bot.username}.`)
  rl.setPrompt('> '); rl.prompt() // gives us a little arrow at the bottom for the input line
})

bot.on('message', (message) => {
  readline.moveCursor(process.stdout, -2, 0) // we move the cursor to the left two places because our cursor is already two positions in (because of the input arrow)
  console.log(message.toAnsi()) // convert our message to ansi to preserve chat formatting
  rl.prompt() // regenerate our little arrow on the input line
})

rl.on('line', (line) => {
  readline.moveCursor(process.stdout, 0, -1) // move cursor up one line
  readline.clearScreenDown(process.stdout) // clear all the lines below the cursor (i.e. the last line we entered)
  bot.chat(line.toString()) // sends the line we entered to ingame chat
})

bot.on('kicked', console.log)
bot.on('error', console.log)
