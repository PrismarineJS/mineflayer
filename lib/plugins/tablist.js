module.exports = inject

function inject (bot) {
  const ChatMessage = require('../chat_message')(bot.version)

  bot.tablist = {
    header: new ChatMessage(''),
    footer: new ChatMessage('')
  }

  bot._client.on('playerlist_header', (packet) => {
    if (packet.header) {
      bot.tablist.header = new ChatMessage(JSON.parse(packet.header))
    }

    if (packet.footer) {
      bot.tablist.footer = new ChatMessage(JSON.parse(packet.footer))
    }
  })
}
