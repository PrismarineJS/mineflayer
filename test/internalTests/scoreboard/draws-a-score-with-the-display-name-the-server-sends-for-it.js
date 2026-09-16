const assert = require('assert')
const { sleep } = require('../../../lib/promise_utils')

function scoreboardHelpers (bot, server) {
  // 1.20.3 dropped the action field from the score packet and moved removal to reset_score.
  const objectiveFields = bot.registry.protocol?.play?.toClient?.types?.packet_scoreboard_objective?.[1] ?? []
  const scoreHasAction = (bot.registry.protocol?.play?.toClient?.types?.packet_scoreboard_score?.[1] ?? [])
    .some(field => field.name === 'action')
  // 1.8 to 1.12 name the objective's render type; later versions send its index.
  const objectiveType = objectiveFields.find(f => f.name === 'type')?.type?.[1]?.fields?.[0] === 'string' ? 'integer' : 0

  const addObjective = (client, name, title) => client.write('scoreboard_objective', {
    name, action: 0, displayText: bot.test.chatText(title), type: objectiveType
  })
  const setScore = (client, objective, entity, value, display) => client.write('scoreboard_score', scoreHasAction
    ? { itemName: entity, action: 0, scoreName: objective, value }
    : { itemName: entity, scoreName: objective, value, display_name: display })

  // Every packet the server sends on join lands in one batch, so the events they raise are all
  // emitted before the first await returns; each test collects them instead of awaiting in turn.
  function collect (...events) {
    const seen = []
    for (const name of events) bot.on(name, (...args) => seen.push([name, ...args]))
    return seen
  }
  // Resolves once the bot has joined and the packets written for it have been handled.
  function onJoin (write) {
    return new Promise(resolve => {
      server.on('playerJoin', (client) => {
        write(client)
        sleep(100).then(resolve)
      })
    })
  }
  return { scoreHasAction, addObjective, setScore, collect, onJoin }
}

module.exports = async function (bot, server) {
  const { scoreHasAction, addObjective, setScore, collect, onJoin } = scoreboardHelpers(bot, server)
  if (scoreHasAction) {
    this.skip()
    return
  }
  const seen = collect('scoreUpdated')
  await onJoin((client) => {
    addObjective(client, 'kills', 'Total Kills')
    setScore(client, 'kills', 'wvffle', 3, bot.test.chatText('Wvffle the Great'))
  })
  assert.ok(seen.length, 'no scoreUpdated')
  assert.strictEqual(seen[0][2].displayName.toString(), 'Wvffle the Great')
}
