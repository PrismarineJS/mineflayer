const assert = require('assert')

module.exports = function (bot, server, done) {
  // On proxy/modded servers the worldName (level name) may differ from
  // the dimension type. For versions with dimensionDataInCodec but
  // without segmentedRegistryCodecData (1.19-1.20.4), the bot should
  // prefer worldType (login) / dimension (respawn) for the codec lookup.
  if (!bot.supportFeature('dimensionDataInCodec') || bot.supportFeature('segmentedRegistryCodecData')) {
    this.skip()
    return
  }

  const loginPacket = bot.test.generateLoginPacket()
  // Simulate a proxy/modded server: worldName is a custom level name
  // but worldType is still the real dimension type
  loginPacket.worldName = 'modded:custom_world'
  loginPacket.worldType = 'minecraft:overworld'

  server.on('playerJoin', (client) => {
    client.write('login', loginPacket)
    bot.once('login', () => {
      assert.strictEqual(bot.game.dimension, 'overworld',
        'should use worldType for dimension, not worldName')
      assert.ok(bot.game.minY !== undefined,
        'minY should be set from codec lookup')
      assert.ok(bot.game.height !== undefined,
        'height should be set from codec lookup')
      done()
    })
  })
}
