const assert = require('assert')

module.exports = (bot, server, done) => {
  const loginPacket = bot.test.generateLoginPacket()
  server.on('playerJoin', (client) => {
    if (bot.supportFeature('usesLoginPacket')) {
      loginPacket.entityId = 0 // Default login packet in minecraft-data 1.16.5 is 1, so set it to 0
    }
    client.write('login', loginPacket)
    bot.once('login', () => {
      assert.ok(bot.entity.id === 0)
      loginPacket.entityId = 42
      bot.once('login', () => {
        assert.ok(bot.entity.id === 42)
        done()
      })
      client.write('login', loginPacket)
    })
  })
}
