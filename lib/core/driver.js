// Connects a sans-io core (see ./health.js) to a bot: feeds it events and performs its outputs.
//
// Outputs are performed in order after `step` returns, so listeners always see the core's
// state fully updated. A listener that dispatches a command re-enters `dispatch`, and that
// command's outputs are performed before the rest of the batch, like a nested synchronous call.

function createDriver (bot, step, state) {
  function dispatch (event) {
    for (const output of step(state, event)) {
      if (output.type === 'send') bot._client.write(output.name, output.data)
      else if (output.type === 'emit') bot.emit(output.event, ...output.args)
      else throw new Error(`unknown output type ${output.type}`)
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

  return { dispatch, exposeState }
}

module.exports = { createDriver }
