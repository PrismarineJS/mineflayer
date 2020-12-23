function inject (bot) {
  bot.waitForTicks = async function (ticks) {
    if (ticks <= 0) return
    await new Promise(resolve => {
      const tickListener = () => {
        ticks--
        if (ticks === 0) {
          this.bot.removeListener('physicTick', tickListener)
          resolve()
        }
      }

      this.bot.on('physicTick', tickListener)
    })
  }
}

module.exports = inject
