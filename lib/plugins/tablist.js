module.exports = inject

const escapeValueNewlines = str => {
  return str.replace(/(": *"(?:\\"|[^"])+")/g, (_, match) => match.replace(/\n/g, '\\n'))
}

function inject (bot) {
  const ChatMessage = require('prismarine-chat')(bot.version)

  bot.tablist = {
    header: new ChatMessage(''),
    footer: new ChatMessage('')
  }

  bot._client.on('playerlist_header', (packet) => {
    if (packet.header) {
      const header = escapeValueNewlines(packet.header)
      bot.tablist.header = new ChatMessage(JSON.parse(header))
    }

    if (packet.footer) {
      const footer = escapeValueNewlines(packet.footer)
      bot.tablist.footer = new ChatMessage(JSON.parse(footer))
    }
  })
}
