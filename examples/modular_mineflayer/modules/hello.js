const mineflayer = require('mineflayer') // eslint-disable-line

/**
 * @param {mineflayer.Bot} bot // to enable intellisense
 */

module.exports = bot => {
  bot.addChatPattern('hello', /<(.+)> (?:Hello|hello)/, { parse: true })

  bot.on('chat:hello', ([[playerIgn]]) => {
    bot.chat(`Hi, ${playerIgn}`)
  })
}
