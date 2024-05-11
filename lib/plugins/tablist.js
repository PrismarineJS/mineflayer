module.exports = inject

const escapeValueNewlines = str => {
  return str.replace(/(": *"(?:\\"|[^"])+")/g, (_, match) => match.replace(/\n/g, '\\n'))
}

function inject (bot) {
  const ChatMessage = require('prismarine-chat')(bot.registry)

  bot.tablist = {
    header: new ChatMessage(''),
    footer: new ChatMessage('')
  }

  bot._client.on('playerlist_header', (packet) => {
    if (bot.supportFeature('chatPacketsUseNbtComponents')) { // 1.20.3+
      bot.tablist.header = ChatMessage.fromNotch(packet.header)
      bot.tablist.footer = ChatMessage.fromNotch(packet.footer)
    } else {
      if (packet.header) {
        const header = escapeValueNewlines(packet.header)
        bot.tablist.header = ChatMessage.fromNotch(header)
      }

      if (packet.footer) {
        const footer = escapeValueNewlines(packet.footer)
        bot.tablist.footer = ChatMessage.fromNotch(footer)
      }
    }
  })
}
