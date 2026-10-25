const assert = require('assert')
const { once, sleep } = require('../../lib/promise_utils')

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

module.exports = {
  'enumerates only the display slots that hold an objective': async (bot, server) => {
    server.on('playerJoin', (client) => client.write('login', bot.test.generateLoginPacket()))
    await once(bot, 'login')
    bot._client.emit('scoreboard_objective', { name: 'test1', action: 0, displayText: JSON.stringify({ text: 'Test 1' }) })
    bot._client.emit('scoreboard_display_objective', { name: 'test1', position: 1 })
    assert.strictEqual(bot.scoreboard.sidebar, bot.scoreboards.test1)
    assert.strictEqual(bot.scoreboard.list, undefined)
    assert.deepStrictEqual(Object.keys(bot.scoreboard), ['1'])
    assert.ok(Object.values(bot.scoreboard).every(sb => sb !== undefined))
    assert.doesNotThrow(() => { for (const sb of Object.values(bot.scoreboard)) assert.strictEqual(sb.title.toString(), 'Test 1') })
    bot._client.emit('scoreboard_objective', { name: 'test1', action: 1 })
    assert.deepStrictEqual(Object.keys(bot.scoreboard), [])
    assert.strictEqual(bot.scoreboard.sidebar, undefined)
  },

  'clears teams and objectives on login but not on respawn': async (bot, server) => {
    function teamAddPacket (teamName, players) {
      const text = bot.registry.supportFeature('teamUsesChatComponents') ? bot.test.chatText : (s) => s
      const mappedMode = bot.registry.version['>=']('1.21.6')
      const enumRules = bot.registry.version['>=']('1.21.5') && bot.registry.version['<']('1.21.6')
      return {
        team: teamName,
        mode: mappedMode ? 'add' : 0,
        name: text(teamName),
        prefix: text(''),
        suffix: text(''),
        friendlyFire: 1,
        flags: { friendly_fire: true, see_friendly_invisible: false },
        nameTagVisibility: enumRules ? 0 : 'always',
        collisionRule: enumRules ? 0 : 'always',
        color: 0,
        formatting: 0,
        players
      }
    }
    function objectiveAddPacket (name) {
      const typeField = bot.registry.protocol.play.toClient.types.packet_scoreboard_objective[1].find(f => f.name === 'type')
      return {
        name,
        action: 0,
        displayText: bot.test.chatText(name),
        type: typeField.type[1].fields[0] === 'string' ? 'integer' : 0
      }
    }
    function respawnPacket (loginPacket) {
      if (!bot.supportFeature('usesLoginPacket')) {
        return { dimension: 0, hashedSeed: [0, 0], gamemode: 0, levelType: 'default' }
      }
      // The respawn packet names the world the login packet declared.
      loginPacket.worldName = 'minecraft:overworld'
      loginPacket.hashedSeed = [0, 0]
      loginPacket.entityId = 0
      const packet = {
        dimension: bot.supportFeature('dimensionDataInCodec') ? 'minecraft:overworld' : loginPacket.dimension,
        worldName: loginPacket.worldName,
        hashedSeed: loginPacket.hashedSeed,
        gamemode: 0,
        previousGamemode: 255,
        isDebug: false,
        isFlat: false,
        copyMetadata: true,
        death: { dimensionName: '', location: { x: 0, y: 0, z: 0 } }
      }
      if (!bot.supportFeature('spawnRespawnWorldDataField')) return packet
      packet.name = loginPacket.worldName
      packet.dimension = loginPacket.dimension
      return { worldState: packet }
    }

    const teamPacketName = bot.supportFeature('teamUsesScoreboard') ? 'scoreboard_team' : 'teams'
    const [client] = await once(server, 'playerJoin')
    const loginPacket = bot.test.generateLoginPacket()
    const teams = bot.teams
    const teamMap = bot.teamMap
    const scoreboards = bot.scoreboards
    const positions = bot.scoreboard

    await client.write('login', loginPacket)
    client.write(teamPacketName, teamAddPacket('red', ['alice']))
    await once(bot, 'teamCreated')
    client.write('scoreboard_objective', objectiveAddPacket('kills'))
    client.write('scoreboard_display_objective', { position: 1, name: 'kills' })
    await once(bot, 'scoreboardPosition')
    assert.deepStrictEqual(bot.teams.red.members, ['alice'])
    assert.strictEqual(bot.teamMap.alice, bot.teams.red)
    assert.strictEqual(bot.scoreboards.kills.name, 'kills')
    assert.strictEqual(bot.scoreboard.sidebar, bot.scoreboards.kills)
    assert.strictEqual(bot.scoreboard[1], bot.scoreboards.kills)

    let removedEvents = 0
    bot.on('teamRemoved', () => removedEvents++)
    bot.on('scoreboardDeleted', () => removedEvents++)
    client.write('login', loginPacket)
    await once(bot, 'login')
    assert.strictEqual(bot.teams, teams)
    assert.strictEqual(bot.teamMap, teamMap)
    assert.strictEqual(bot.scoreboards, scoreboards)
    assert.strictEqual(bot.scoreboard, positions)
    assert.deepStrictEqual(Object.keys(bot.teams), [])
    assert.deepStrictEqual(Object.keys(bot.teamMap), [])
    assert.deepStrictEqual(Object.keys(bot.scoreboards), [])
    assert.strictEqual(bot.scoreboard[1], undefined)
    assert.strictEqual(bot.scoreboard.sidebar, undefined)
    assert.strictEqual(bot.scoreboard.list, undefined)
    assert.strictEqual(bot.scoreboard.belowName, undefined)
    assert.strictEqual(removedEvents, 0)

    client.write(teamPacketName, teamAddPacket('red', ['bob']))
    await once(bot, 'teamCreated')
    assert.deepStrictEqual(bot.teams.red.members, ['bob'])
    assert.strictEqual(bot.teamMap.alice, undefined)

    client.write('respawn', respawnPacket(loginPacket))
    await once(bot, 'respawn')
    assert.deepStrictEqual(bot.teams.red.members, ['bob'])
    assert.strictEqual(bot.teamMap.bob, bot.teams.red)
  },

  'reads the objective title, whatever shape the version sends it in': async (bot, server) => {
    const { addObjective, collect, onJoin } = scoreboardHelpers(bot, server)
    const seen = collect('scoreboardCreated', 'scoreboardPosition')
    await onJoin((client) => {
      addObjective(client, 'kills', 'Total Kills')
      client.write('scoreboard_display_objective', { position: 1, name: 'kills' })
    })
    const created = seen.find(e => e[0] === 'scoreboardCreated')
    assert.ok(created, 'no scoreboardCreated')
    assert.strictEqual(created[1].title.toString(), 'Total Kills')
    assert.ok(seen.some(e => e[0] === 'scoreboardPosition'), 'no scoreboardPosition')
    assert.strictEqual(bot.scoreboard.sidebar, bot.scoreboards.kills)
  },

  'records a score and drops it again': async (bot, server) => {
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
  },

  'draws a score with the display name the server sends for it': async function (bot, server) {
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
  },

  'drops a score from every objective when reset_score names none': async function (bot, server) {
    const { scoreHasAction, addObjective, setScore, onJoin } = scoreboardHelpers(bot, server)
    if (scoreHasAction) {
      this.skip()
      return
    }
    let client
    await onJoin((c) => {
      client = c
      addObjective(c, 'kills', 'Total Kills')
      addObjective(c, 'deaths', 'Total Deaths')
      setScore(c, 'kills', 'wvffle', 7)
      setScore(c, 'deaths', 'wvffle', 2)
    })
    assert.strictEqual(bot.scoreboards.kills.itemsMap.wvffle.value, 7)
    assert.strictEqual(bot.scoreboards.deaths.itemsMap.wvffle.value, 2)
    client.write('reset_score', { entity_name: 'wvffle', objective_name: undefined })
    await sleep(100)
    assert.strictEqual(bot.scoreboards.kills.itemsMap.wvffle, undefined)
    assert.strictEqual(bot.scoreboards.deaths.itemsMap.wvffle, undefined)
  },

  'leaves every objective alone when a removal names an unknown one': async (bot, server) => {
    const { scoreHasAction, addObjective, setScore, collect, onJoin } = scoreboardHelpers(bot, server)
    const seen = collect('scoreRemoved')
    let client
    await onJoin((c) => {
      client = c
      addObjective(c, 'kills', 'Total Kills')
      addObjective(c, 'deaths', 'Total Deaths')
      setScore(c, 'kills', 'wvffle', 7)
      setScore(c, 'deaths', 'wvffle', 2)
    })
    if (scoreHasAction) client.write('scoreboard_score', { itemName: 'wvffle', action: 1, scoreName: 'missing' })
    else client.write('reset_score', { entity_name: 'wvffle', objective_name: 'missing' })
    await sleep(100)
    assert.strictEqual(seen.length, 0)
    assert.strictEqual(bot.scoreboards.kills.itemsMap.wvffle.value, 7)
    assert.strictEqual(bot.scoreboards.deaths.itemsMap.wvffle.value, 2)
  }
}
