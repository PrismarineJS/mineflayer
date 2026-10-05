/* eslint-env mocha */
// Tests for the sans-io health core (lib/core/health.js): no server, socket or timers.

const assert = require('assert')
const { EventEmitter } = require('events')
const { testedVersions } = require('../lib/version')
const { createState, step } = require('../lib/core/health')
const injectHealth = require('../lib/plugins/health')

const health = (value) => ({ type: 'packet', name: 'update_health', data: { health: value, food: 18, foodSaturation: 2.5 } })
const respawnPacket = { type: 'packet', name: 'respawn', data: {} }
const respawnCommand = { type: 'command', name: 'respawn' }
// Each output as a short label: "send player_loaded", "emit spawn"
const labels = (outputs) => outputs.map(o => o.type === 'send' ? `send ${o.name}` : `emit ${o.event}`)

for (const version of testedVersions) {
  const registry = require('prismarine-registry')(version)
  const supportFeature = registry.supportFeature
  const spawned = supportFeature('sendsPlayerLoadedPacket') ? ['send player_loaded', 'emit spawn'] : ['emit spawn']
  const respawnData = supportFeature('respawnIsPayload') ? { payload: 0 } : { actionId: 0 }
  const newState = (respawn = true) => createState({ supportFeature, respawn })

  describe(`health core ${version}v`, () => {
    it('spawns on the first health update when alive', () => {
      const state = newState()
      assert.deepStrictEqual(labels(step(state, health(20))), [...spawned, 'emit health'])
      assert.strictEqual(state.health, 20)
      assert.strictEqual(state.food, 18)
      assert.strictEqual(state.foodSaturation, 2.5)
      assert.strictEqual(state.isAlive, true)
    })

    it('only spawns once while alive', () => {
      const state = newState()
      step(state, health(20))
      assert.deepStrictEqual(labels(step(state, health(15))), ['emit health'])
    })

    it('does not spawn when the first health update is a death', () => {
      const state = newState()
      const out = step(state, health(0))
      assert.deepStrictEqual(labels(out), ['emit health', 'emit death', 'send client_command'])
      assert.deepStrictEqual(out[2].data, respawnData)
      assert.strictEqual(state.isAlive, false)
    })

    it('dies once but asks to respawn on every dead health update', () => {
      const state = newState()
      step(state, health(20))
      assert.deepStrictEqual(labels(step(state, health(0))), ['emit health', 'emit death', 'send client_command'])
      assert.deepStrictEqual(labels(step(state, health(0))), ['emit health', 'send client_command'])
    })

    it('does not respawn automatically when the respawn option is off', () => {
      const state = newState(false)
      step(state, health(20))
      assert.deepStrictEqual(labels(step(state, health(0))), ['emit health', 'emit death'])
      assert.deepStrictEqual(labels(step(state, respawnCommand)), ['send client_command'])
    })

    it('spawns again when health comes back after a death', () => {
      const state = newState()
      step(state, health(20))
      step(state, health(0))
      assert.deepStrictEqual(labels(step(state, health(20))), ['emit health', ...spawned])
      assert.strictEqual(state.isAlive, true)
    })

    it('is not alive between a respawn packet and the next health update', () => {
      const state = newState()
      step(state, health(20))
      assert.deepStrictEqual(labels(step(state, respawnPacket)), ['emit respawn'])
      assert.strictEqual(state.isAlive, false)
      assert.deepStrictEqual(labels(step(state, health(20))), ['emit health', ...spawned])
    })

    it('ignores the respawn command while alive', () => {
      const state = newState()
      step(state, health(20))
      assert.deepStrictEqual(step(state, respawnCommand), [])
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
      assert.deepStrictEqual(written.filter(p => p.name === 'client_command').map(p => p.data), [respawnData, respawnData])

      // The properties stay assignable, as plain properties were
      bot.health = 7
      assert.strictEqual(bot.health, 7)
    })
  })
}
