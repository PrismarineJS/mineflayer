const fs = require('fs')
const path = require('path')
const mineflayer = require('mineflayer')

const OPTIONS = {
  username: 'i_am_u9g',
  host: 'localhost'
}

function injectModules (bot) {
  const MODULES_DIRECTORY = path.join(__dirname, 'modules')
  const modules = fs
    .readdirSync(MODULES_DIRECTORY) // find the plugins
    .filter(x => x.endsWith('.js')) // only use .js files
    .map(pluginName => require(path.join(MODULES_DIRECTORY, pluginName)))

  bot.loadPlugins(modules)
}

function initBot () {
  const bot = mineflayer.createBot(OPTIONS)
  injectModules(bot)

  bot.on('end', initBot) // auto restart
}

initBot() // start the bot
