module.exports = inject

const escapeValueNewlines = str => {
  return str.replace(/": *"((?:\\"|[^"])+)/, (_, match) => '":"' + match.replace('\n', '\\n'))
}

function inject (bot) {
  const ChatMessage = require('../chat_message')(bot.version)

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
