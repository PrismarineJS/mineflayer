/* eslint-env mocha */
// Tests for health without a server: the sans-io core (lib/core/health.js) with no version data,
// its codec (lib/core/healthCodec.js) against each tested version's packet schema, and the plugin.

const assert = require('assert')
const { EventEmitter } = require('events')
const mc = require('minecraft-protocol')
const { testedVersions } = require('../lib/version')
const { createConfig, createState, step } = require('../lib/core/health')
const { createCodec } = require('../lib/core/healthCodec')
const injectHealth = require('../lib/plugins/health')

const health = (value) => ({ type: 'healthUpdate', health: value, food: 18, foodSaturation: 2.5 })
const respawned = { type: 'respawned' }
const respawnCommand = { type: 'respawnCommand' }
// Each output as a short label: "clientLoaded", "emit spawn"
const labels = (outputs) => outputs.map(o => o.type === 'emit' ? `emit ${o.event}` : o.type)
const spawned = ['clientLoaded', 'emit spawn']

// A fresh core; feed(event) steps it and returns the output labels
function newCore (respawn = true) {
  const config = createConfig({ respawn })
  const state = createState()
  return { state, feed: (event) => labels(step(config, state, event)) }
}

// The core has no version data, so it runs once. CI only runs tests whose name contains a
// tested version (mocha -g "<version>v"), so the suite is named after the newest one.
describe(`health core ${testedVersions[testedVersions.length - 1]}v`, () => {
  it('spawns on the first health update when alive', () => {
    const { state, feed } = newCore()
    assert.deepStrictEqual(feed(health(20)), [...spawned, 'emit health'])
    assert.strictEqual(state.health, 20)
    assert.strictEqual(state.food, 18)
    assert.strictEqual(state.foodSaturation, 2.5)
    assert.strictEqual(state.isAlive, true)
  })

  it('only spawns once while alive', () => {
    const { feed } = newCore()
    feed(health(20))
    assert.deepStrictEqual(feed(health(15)), ['emit health'])
  })

  it('does not spawn when the first health update is a death', () => {
    const { state, feed } = newCore()
    assert.deepStrictEqual(feed(health(0)), ['emit health', 'emit death', 'requestRespawn'])
    assert.strictEqual(state.isAlive, false)
  })

  it('dies once but asks to respawn on every dead health update', () => {
    const { feed } = newCore()
    feed(health(20))
    assert.deepStrictEqual(feed(health(0)), ['emit health', 'emit death', 'requestRespawn'])
    assert.deepStrictEqual(feed(health(0)), ['emit health', 'requestRespawn'])
  })

  it('does not respawn automatically when the respawn option is off', () => {
    const { feed } = newCore(false)
    feed(health(20))
    assert.deepStrictEqual(feed(health(0)), ['emit health', 'emit death'])
    assert.deepStrictEqual(feed(respawnCommand), ['requestRespawn'])
  })

  it('spawns again when health comes back after a death', () => {
    const { state, feed } = newCore()
    feed(health(20))
    feed(health(0))
    assert.deepStrictEqual(feed(health(20)), ['emit health', ...spawned])
    assert.strictEqual(state.isAlive, true)
  })

  it('is not alive between a respawn packet and the next health update', () => {
    const { state, feed } = newCore()
    feed(health(20))
    assert.deepStrictEqual(feed(respawned), ['emit respawn'])
    assert.strictEqual(state.isAlive, false)
    assert.deepStrictEqual(feed(health(20)), ['emit health', ...spawned])
  })

  it('ignores the respawn command while alive', () => {
    const { feed } = newCore()
    feed(health(20))
    assert.deepStrictEqual(feed(respawnCommand), [])
  })
})

for (const version of testedVersions) {
  const supportFeature = require('prismarine-registry')(version).supportFeature
  const protocol = require('minecraft-data')(version).protocol.play
  const codec = createCodec(supportFeature)

  describe(`health codec ${version}v`, () => {
    // Write a packet with this version's schema and parse it back, as the other side would
    let clientSends, serverSends
    before(() => {
      const roundTrip = (isServer) => {
        const serializer = mc.createSerializer({ state: 'play', isServer, version })
        const deserializer = mc.createDeserializer({ state: 'play', isServer: !isServer, version })
        return (name, params) => deserializer.parsePacketBuffer(serializer.createPacketBuffer({ name, params })).data.params
      }
      clientSends = roundTrip(false)
      serverSends = roundTrip(true)
    })

    it('listens only to packets this version has', () => {
      for (const name of codec.packets) assert.ok(protocol.toClient.types[`packet_${name}`], name)
    })

    it('decodes update_health as this version sends it', () => {
      const update = serverSends('update_health', { health: 20, food: 18, foodSaturation: 2.5 })
      assert.deepStrictEqual(codec.decode('update_health', update), health(20))
    })

    it('encodes outputs into packets with the fields this version has', () => {
      for (const type of ['clientLoaded', 'requestRespawn']) {
        for (const { name, data } of codec.encode({ type })) {
          // Compares field names only: a mapped field reads back as its name (26.1+ actionId 0 is 'perform_respawn')
          assert.deepStrictEqual(Object.keys(clientSends(name, data)), Object.keys(data), `${type} -> ${name}`)
        }
      }
    })

    it('sends player_loaded exactly when this version has it', () => {
      const sent = codec.encode({ type: 'clientLoaded' }).map(p => p.name)
      assert.deepStrictEqual(sent, protocol.toServer.types.packet_player_loaded ? ['player_loaded'] : [])
    })

    it('keeps the bot API working through the plugin', () => {
      const bot = new EventEmitter()
      bot.supportFeature = supportFeature
      bot._client = new EventEmitter()
      const written = []
      bot._client.write = (name, data) => written.push({ name, data })
      injectHealth(bot, { respawn: true })

      assert.strictEqual(bot.isAlive, true)
      assert.strictEqual(bot.health, undefined)
      let healthOnSpawn
      bot.once('spawn', () => { healthOnSpawn = bot.health })
      bot._client.emit('update_health', { health: 20, food: 18, foodSaturation: 2.5 })
      assert.strictEqual(healthOnSpawn, 20)
      assert.strictEqual(bot.food, 18)

      // A death listener that respawns by hand re-enters the core before auto-respawn runs
      bot.once('death', () => bot.respawn())
      bot._client.emit('update_health', { health: 0, food: 18, foodSaturation: 2.5 })
      assert.strictEqual(bot.isAlive, false)
      assert.strictEqual(written.filter(p => p.name === 'client_command').length, 2)

      // The properties stay assignable, as plain properties were
      bot.health = 7
      assert.strictEqual(bot.health, 7)
    })
  })
}
