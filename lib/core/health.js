// Health and respawn as a sans-io state machine: step(state, event) -> outputs.
// No sockets, timers or event emitters here; lib/plugins/health.js connects it to the bot.
//
// Events:  { type: 'packet', name, data }   a clientbound packet
//          { type: 'command', name: 'respawn' }
// Outputs: { type: 'send', name, data }     a serverbound packet
//          { type: 'emit', event, args }    a bot event

function createState ({ supportFeature, respawn }) {
  return {
    features: {
      // 1.21.4+ servers ignore block and item interactions until the client has
      // sent player_loaded (or 60 ticks have passed)
      sendsPlayerLoaded: !!supportFeature('sendsPlayerLoadedPacket'),
      respawnIsPayload: !!supportFeature('respawnIsPayload')
    },
    autoRespawn: respawn,
    isAlive: true,
    health: undefined,
    food: undefined,
    foodSaturation: undefined,
    receivedHealth: false
  }
}

function step (state, event) {
  const out = []
  if (event.type === 'packet') {
    if (event.name === 'respawn') onRespawn(state, out)
    else if (event.name === 'update_health') onUpdateHealth(state, event.data, out)
  } else if (event.type === 'command' && event.name === 'respawn') {
    respawn(state, out)
  }
  return out
}

function onRespawn (state, out) {
  state.isAlive = false
  out.push(emit('respawn'))
}

function onUpdateHealth (state, packet, out) {
  // The first health update spawns the bot, if it is alive
  if (!state.receivedHealth) {
    state.receivedHealth = true
    if (packet.health > 0) spawn(state, out)
  }

  state.health = packet.health
  state.food = packet.food
  state.foodSaturation = packet.foodSaturation
  out.push(emit('health'))
  if (state.health <= 0) {
    if (state.isAlive) {
      state.isAlive = false
      out.push(emit('death'))
    }
    if (state.autoRespawn) respawn(state, out)
  } else if (!state.isAlive) {
    state.isAlive = true
    spawn(state, out)
  }
}

function spawn (state, out) {
  if (state.features.sendsPlayerLoaded) out.push(send('player_loaded', {}))
  out.push(emit('spawn'))
}

function respawn (state, out) {
  if (state.isAlive) return
  out.push(send('client_command', state.features.respawnIsPayload ? { payload: 0 } : { actionId: 0 }))
}

function send (name, data) { return { type: 'send', name, data } }
function emit (event, ...args) { return { type: 'emit', event, args } }

module.exports = { createState, step }
