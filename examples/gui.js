const mineflayer = require('mineflayer')
const gui = require('mineflayer-gui')
const ChatMessage = require('prismarine-chat')('1.8.9')

function Options (window, hotbar) {
  this.window = window
  this.hotbar = hotbar
}

function ItemMatch (display) {
  this.name = new ChatMessage(display)
}

async function login () {
  // click "Game Menu" -> "Skywars" -> "Solo"
  await bot.gui.clickItem(
    new Options(bot.currentWindow, true),
    new ItemMatch('Game Menu'),
    new ItemMatch('Skywars'),
    new ItemMatch('Solo')
  )

  // after joining skywars, get all items in the "Select Team" menu
  const teams = await bot.gui.getItems(
    new Options(bot.currentWindow, true),
    new ItemMatch('Select Team'),
    new ItemMatch('') // matches all items
  )

  // log all the teams
  for (const team of teams) {
    const display = bot.gui.item.getName(team)
    console.log(display.toString())
  }
}

const bot = mineflayer.createBot()
bot.loadPlugin(gui)
bot.once('login', login)
