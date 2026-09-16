const assert = require('assert')

module.exports = (bot, server, done) => {
  const HEADER = 'asd\ndsa'
  const FOOTER = '\nas\nas\nas\n'
  bot._client.on('playerlist_header', (packet) => {
    setImmediate(() => {
      assert.strictEqual(bot.tablist.header.toString(), HEADER)
      assert.strictEqual(bot.tablist.footer.toString(), FOOTER)
      done()
    })
  })
  // TODO: figure out how the "extra" should be encoded in NBT so this branch can be removed
  if (bot.registry.supportFeature('chatPacketsUseNbtComponents')) {
    server.on('playerJoin', (client) => {
      client.write('playerlist_header', {
        header: bot.test.chatText(HEADER),
        footer: bot.test.chatText(FOOTER)
      })
    })
  } else {
    server.on('playerJoin', (client) => {
      client.write('playerlist_header', {
        header: JSON.stringify({ text: '', extra: [{ text: HEADER, color: 'yellow' }] }),
        footer: JSON.stringify({ text: '', extra: [{ text: FOOTER, color: 'yellow' }] })
      })
    })
  }
}
