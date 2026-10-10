const assert = require('assert')
const mc = require('minecraft-protocol')
const { EventEmitter } = require('events')

module.exports = function (bot, server) {
  // The accept must carry the pack's real UUID bytes; a uuid-1345 object serializes to
  // 16 zero bytes.
  // The mock server never reaches the configuration phase, so the plugin is driven directly.
  if (!bot.registry.supportFeature('resourcePackUsesUUID')) {
    this.skip()
    return
  }
  const packUuid = '8ef4746b-93b7-3c32-9dcb-b375016c114d'
  const expectedBytes = Buffer.from(packUuid.replace(/-/g, ''), 'hex')
  const serializer = mc.createSerializer({ state: 'configuration', isServer: false, version: bot.version })

  const client = new EventEmitter()
  client.state = 'configuration'
  const writes = []
  client.write = (name, params) => { writes.push({ name, params }) }
  const fakeBot = new EventEmitter()
  fakeBot._client = client
  fakeBot.supportFeature = bot.registry.supportFeature.bind(bot.registry)
  require('../../../lib/plugins/resource_pack')(fakeBot)

  client.emit('add_resource_pack', {
    uuid: packUuid,
    url: 'https://example.invalid/pack.zip',
    hash: '88b406352dc8a335b1050a4bf9577a878c812012',
    forced: false
  })

  const accept = writes.find((w) => w.name === 'resource_pack_receive')
  assert(accept, 'bot should answer the pack during the configuration phase')
  const buf = serializer.createPacketBuffer({ name: accept.name, params: accept.params })
  assert(buf.includes(expectedBytes),
    'resource_pack_receive must carry the pack UUID bytes, not a zero UUID')
}
