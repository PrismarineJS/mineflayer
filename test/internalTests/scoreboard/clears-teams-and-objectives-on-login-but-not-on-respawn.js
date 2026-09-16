const assert = require('assert')
const { once } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
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
}
