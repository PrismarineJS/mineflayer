// The packet format of the health core (./health.js) for one version: decodes clientbound
// packets into core events and encodes core outputs into serverbound packets. All version
// differences in packet names and fields live here; the core only sees the events above.

function createCodec (supportFeature) {
  // 1.21.4+ servers ignore block and item interactions until the client has
  // sent player_loaded (or 60 ticks have passed)
  const sendsPlayerLoaded = !!supportFeature('sendsPlayerLoadedPacket')
  const respawnIsPayload = !!supportFeature('respawnIsPayload')

  return {
    // In the order the plugin registered its listeners before, since handler order is observable
    packets: ['respawn', 'update_health'],

    decode (name, data) {
      if (name === 'respawn') return { type: 'respawned' }
      if (name === 'update_health') {
        return { type: 'healthUpdate', health: data.health, food: data.food, foodSaturation: data.foodSaturation }
      }
      throw new Error(`health codec can't decode ${name}`)
    },

    // Returns the packets for an output, as { name, data }; none if this version has no such packet
    encode (output) {
      if (output.type === 'clientLoaded') return sendsPlayerLoaded ? [{ name: 'player_loaded', data: {} }] : []
      if (output.type === 'requestRespawn') {
        return [{ name: 'client_command', data: respawnIsPayload ? { payload: 0 } : { actionId: 0 } }]
      }
      throw new Error(`health codec can't encode ${output.type}`)
    }
  }
}

module.exports = { createCodec }
