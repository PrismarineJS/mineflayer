/*
  Make a function that is exported, this will be the "inject function", which is called when loading the plugin into mineflayer.
  You can load this plugin into mineflayer in three ways:

  1.
  ```
  bot.createBot({
    plugins: [require('./plugin')]
  })
  ```

  2.
  ```
  bot.createBot({
    plugins: {
      afk: require('./plugin')
    }
  })
  ```

  3.
  ```
  const bot = bot.createBot()
  bot.loadPlugin(require('./plugin'))
  ```
*/
module.exports = bot => {
  /*
    Inside the scope of this function, you should do anything you need to with the bot object, like add properties to it, like `bot.afk`,
    this function will be called when this plugin is called during the login process
  */
  let rotater
  let rotated = false
  bot.afk = {}

  bot.afk.start = () => {
    if (rotater) return
    rotater = setInterval(rotate, 3000)
  }

  bot.afk.stop = () => {
    if (!rotater) return
    clearInterval(rotater)
  }

  function rotate () {
    bot.look(rotated ? 0 : Math.PI, 0)
    rotated = !rotated
  }
}
