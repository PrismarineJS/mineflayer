// All plugins are loaded with the bot.loadPlugin function, look at documentation for more info
// https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#botloadpluginplugin
// Here is an example AFK plugin

// Each plugin should have a inject function
// This is the function that will be put in bot.loadPlugin
function inject (bot, option) {
  // create a scope for you functions
  bot.afk = {}

  let afkInterval, rotation
  // This scope can be used to store some variables for user reference.
  bot.afk.status = 'Idle'

  // All your plugin functions should be in the scope other than the logic.
  bot.afk.start = async () => {
    afkInterval = setInterval(async () => {
      if (rotation === 0) {
        await bot.look(0, 0)
        rotation = true
      } else {
        await bot.look(Math.PI, 0)
        rotation = false
      }
    }, 3000)
    bot.afk.status = 'afk'
  }

  bot.afk.stop = () => {
    if (afkInterval) {
      clearInterval(afkInterval)
      bot.afk.status = 'Idle'
    }
  }
}

module.exports = {
  afk: inject
}
// This is a simple plugin with two methods, start and stop.