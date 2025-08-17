module.exports = inject

// TODO: apply this to all versions and rename scoreboard_team -> teams in minecraft-data
const TEAM_MODES = ['add', 'remove', 'change', 'join', 'leave']

function inject (bot) {
  const Team = require('../team')(bot.registry)
  const teams = {}

  function teamHandler (packet) {
    console.log('team.packet', packet)

    const { team: teamName, players = [] } = packet
    const mode = TEAM_MODES[packet.mode] || packet.mode

    let team = teams[teamName]
    console.log('Team', team)

    switch (mode) {
      case 'add':
        team = new Team(
          teamName,
          packet.name,
          packet.friendlyFire,
          packet.nameTagVisibility,
          packet.collisionRule,
          packet.formatting,
          packet.prefix,
          packet.suffix
        )
        for (const player of players) {
          team.add(player)
          bot.teamMap[player] = team
        }
        teams[teamName] = team
        console.log('Team Created', team)
        bot.emit('teamCreated', teams[teamName])
        break

      case 'remove':
        if (!team) break
        team.members.forEach((member) => {
          delete bot.teamMap[member]
        })
        delete teams[teamName]
        bot.emit('teamRemoved', teams[teamName])
        break

      case 'change':
        if (!team) break
        team.update(
          packet.name,
          packet.friendlyFire,
          packet.nameTagVisibility,
          packet.collisionRule,
          packet.formatting,
          packet.prefix,
          packet.suffix
        )
        bot.emit('teamUpdated', teams[teamName])
        break

      case 'join':
        if (!team) break
        for (const player of players) {
          team.add(player)
          bot.teamMap[player] = team
        }
        console.log('Emitting teamMemberAdded')
        bot.emit('teamMemberAdded', teams[teamName])
        break

      case 'leave':
        if (!team) break
        for (const player of players) {
          team.remove(player)
          delete bot.teamMap[player]
        }
        bot.emit('teamMemberRemoved', teams[teamName])
        break

      default:
        console.warn(`Unknown team mode: ${mode}`)
    }
  }

  if (bot.supportFeature('teamUsesScoreboard')) {
    bot._client.on('scoreboard_team', teamHandler)
  } else {
    bot._client.on('teams', teamHandler)
  }

  bot.teams = teams
  bot.teamMap = {}
}
