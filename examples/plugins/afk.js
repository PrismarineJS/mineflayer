function inject (bot, option) {
  // it is a good idea to make a same space for your plugin
  bot.afk = {
    start,
    stop
  }

  let afk; let rotation = 0

  async function start () {
    afk = setInterval(async () => {
      if (rotation === 0) {
        await bot.look(0, 0)
        rotation = 1
      } else {
        await bot.look(Math.PI, 0)
        rotation = 0
      }
    }, 3000)
  }

  function stop () {
    if (!afk) return
    clearInterval(afk)
  }
}

module.exports = {
  afk: inject
}
