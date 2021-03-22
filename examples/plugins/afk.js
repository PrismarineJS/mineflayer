// Plugins are loaded using the bot.loadPlugin() function
// The load plugin function excepts one function as its only parameter
// The plugin runs the function passing it two parameter
// The former is the bot object and the latter is the bot option
// the options contain version player info and other plugins
// Here is an example AFK plugin

// Each plugin should have a inject function
// This is the function that will be put in bot.loadPlugin
function inject (bot, option) {
// It is a good idea to make a namespace for your plugin
  bot.afk = {}

  let afkInterval, rotation
  // This namespace can be used to store some variables for user reference.
  bot.afk.status = 'Idle'

  // All your plugin functions should be in the name space other than the logic.
  bot.afk.start = async function () {
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

  bot.afk.stop = function () {
    if (afkInterval) {
      clearInterval(afkInterval)
      bot.afk.status = 'Idle'
    }
  }
}

// Most of the time plugins are stored in different files so you must export them.
module.exports = {
  // Here you should name your inject function what ever you want.
  afk: inject
}

// This is a simple plugin with two methods, start and stop.
// On the start method this plugin makes the bot look from east to west in 3-second intervals,
// On stop it stops the bot from looking constantly spinning around
// Additionally it also has a status variable inside the name space,
// Users can use the variable as a reference for the code.
