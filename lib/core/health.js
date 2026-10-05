// Health and respawn as a sans-io state machine: step(config, state, event) -> outputs.
// No sockets, timers, event emitters or packet formats here: ./healthCodec.js turns packets
// into events and outputs into packets, and lib/plugins/health.js connects both to the bot.
//
// Events:  { type: 'healthUpdate', health, food, foodSaturation }
//          { type: 'respawned' }        the server sent the bot to a new life or dimension
//          { type: 'respawnCommand' }   bot.respawn() was called
// Outputs: { type: 'clientLoaded' }     the client is ready for the server's world
//          { type: 'requestRespawn' }
//          { type: 'emit', event, args } a bot event

function createConfig ({ respawn }) {
  return Object.freeze({ autoRespawn: respawn })
}

function createState () {
  return {
    isAlive: true,
    health: undefined,
    food: undefined,
    foodSaturation: undefined,
    receivedHealth: false
  }
}

function step (config, state, event) {
  const out = []
  if (event.type === 'healthUpdate') onHealthUpdate(config, state, event, out)
  else if (event.type === 'respawned') onRespawned(state, out)
  else if (event.type === 'respawnCommand') respawn(state, out)
  return out
}

function onRespawned (state, out) {
  state.isAlive = false
  out.push(emit('respawn'))
}

function onHealthUpdate (config, state, update, out) {
  // The first health update spawns the bot, if it is alive
  if (!state.receivedHealth) {
    state.receivedHealth = true
    if (update.health > 0) spawn(out)
  }

  state.health = update.health
  state.food = update.food
  state.foodSaturation = update.foodSaturation
  out.push(emit('health'))
  if (state.health <= 0) {
    if (state.isAlive) {
      state.isAlive = false
      out.push(emit('death'))
    }
    if (config.autoRespawn) respawn(state, out)
  } else if (!state.isAlive) {
    state.isAlive = true
    spawn(out)
  }
}

function spawn (out) {
  out.push({ type: 'clientLoaded' })
  out.push(emit('spawn'))
}

function respawn (state, out) {
  if (state.isAlive) return
  out.push({ type: 'requestRespawn' })
}

function emit (event, ...args) { return { type: 'emit', event, args } }

module.exports = { createConfig, createState, step }
