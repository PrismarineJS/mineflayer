module.exports = inject

function inject (bot) {
  const Team = require('../team')(bot.version)
  const teams = {}

  function teamHandler (packet) {
    const { team: teamName, mode } = packet
    let team = teams[teamName]
    if (mode === 0) {
      team = new Team(
        packet.team,
        packet.name,
        packet.friendlyFire,
        packet.nameTagVisibility,
        packet.collisionRule,
        packet.formatting,
        packet.prefix,
        packet.suffix
      )
      if (Array.isArray(packet.players)) {
        packet.players.forEach(player => {
          team.add(player)
          bot.teamMap[player] = team
        })
      }
      teams[teamName] = team
      bot.emit('teamCreated', teams[teamName])
    }
    if (team !== undefined) {
      if (mode === 1) {
        team.members.forEach(member => {
          delete bot.teamMap[member]
        })
        delete teams[teamName]
        bot.emit('teamRemoved', teams[teamName])
      }
      if (mode === 2) {
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
      }
      if (Array.isArray(packet.players)) {
        if (mode === 3) {
          packet.players.forEach((player) => {
            team.add(player)
            bot.teamMap[player] = team
          })
          bot.emit('teamMemberAdded', teams[teamName])
        }
        if (mode === 4) {
          packet.players.forEach((player) => {
            team.remove(player)
            delete bot.teamMap[player]
          })
          bot.emit('teamMemberRemoved', teams[teamName])
        }
      }
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
