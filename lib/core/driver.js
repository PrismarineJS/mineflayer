// Connects a sans-io core (see ./health.js) and its codec (see ./healthCodec.js) to a bot:
// decodes the codec's packets into core events, and performs the core's outputs.
//
// Outputs are performed in order after `step` returns, so listeners always see the core's
// state fully updated. A listener that dispatches a command re-enters `dispatch`, and that
// command's outputs are performed before the rest of the batch, like a nested synchronous call.

function createDriver (bot, { step, config, state, codec }) {
  function dispatch (event) {
    for (const output of step(config, state, event)) {
      if (output.type === 'emit') bot.emit(output.event, ...output.args)
      else for (const { name, data } of codec.encode(output)) bot._client.write(name, data)
    }
  }

  function listen () {
    for (const name of codec.packets) {
      bot._client.on(name, (data) => dispatch(codec.decode(name, data)))
    }
  }

  // Exposes state[key] as bot[key]. A plain read-write property, as before, so user code
  // that assigns it (for instance in tests) keeps working.
  function exposeState (keys) {
    for (const key of keys) {
      Object.defineProperty(bot, key, {
        get: () => state[key],
        set: (value) => { state[key] = value },
        enumerable: true,
        configurable: true
      })
    }
  }

  return { dispatch, listen, exposeState }
}

module.exports = { createDriver }
