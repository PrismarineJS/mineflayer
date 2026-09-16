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

module.exports = async (bot, server) => {
  const { scoreHasAction, addObjective, setScore, collect, onJoin } = scoreboardHelpers(bot, server)
  const seen = collect('scoreUpdated', 'scoreRemoved')
  let client
  await onJoin((c) => {
    client = c
    addObjective(c, 'kills', 'Total Kills')
    setScore(c, 'kills', 'wvffle', 7)
  })
  const updated = seen.find(e => e[0] === 'scoreUpdated')
  assert.ok(updated, 'no scoreUpdated')
  const [, scoreboard, added] = updated
  assert.strictEqual(added.value, 7)
  assert.strictEqual(scoreboard.itemsMap.wvffle, added)
  assert.strictEqual(added.displayName.toString(), 'wvffle')

  if (scoreHasAction) client.write('scoreboard_score', { itemName: 'wvffle', action: 1, scoreName: 'kills' })
  else client.write('reset_score', { entity_name: 'wvffle', objective_name: 'kills' })
  await sleep(100)
  const removal = seen.find(e => e[0] === 'scoreRemoved')
  assert.ok(removal, 'no scoreRemoved')
  assert.strictEqual(removal[2].value, 7)
  assert.strictEqual(bot.scoreboards.kills.itemsMap.wvffle, undefined)
}
