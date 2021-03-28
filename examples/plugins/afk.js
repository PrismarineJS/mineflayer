// All plugins are loaded with the bot.loadPlugin function, look at documentation for more info
// https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#botloadpluginplugin
// Here is an example AFK plugin

// Each plugin should have a inject function
// This is the function that will be put in bot.loadPlugin
function inject (bot, option) {
  // create a scope for you functions
  bot.afk = {}

  let afkInterval, rotation

  // All your plugin functions should be in the scope other than the logic.
  bot.afk.start = async () => {
    afkInterval = setInterval(async () => {
      if (rotation) {
        await bot.look(0, 0)
        rotation = false
      } else {
        await bot.look(Math.PI, 0)
        rotation = true
      }
    }, 3000)
  }

  bot.afk.stop = () => {
    if (afkInterval) {
      clearInterval(afkInterval)
    }
  }
}

// finally export the inject function

module.exports = {
  afk: inject
}
