/*
 * A simple example to show the display board functionality
 */
const mineflayer = require('mineflayer')

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node scoreboard.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'scoreboard',
  password: process.argv[5]
})

// /scoreboard objectives add Kills totalKillCount
// /scoreboard objectives setDisplay sidebar Kills
bot.on('scoreboardCreated', (scoreboard) => {
  bot.chat(`New scoreboard: ${scoreboard.name}, ${scoreboard.title}`)
  console.log(scoreboard)
})

// kill a mob for this to be displayed
bot.on('scoreboardScoreUpdated', (scoreboard, updated) => {
  bot.chat(`Scoreboard score : ${scoreboard.title}, ${updated.name}, ${updated.value}`)
  console.log(scoreboard)
})
