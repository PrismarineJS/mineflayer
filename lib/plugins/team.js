module.exports = inject

function inject (bot) {
  const Team = require('../team')(bot.registry)
  const teams = {}

  function teamHandler (packet) {
    const { team: teamName } = packet
    const mode = ['add', 'remove', 'change', 'join', 'leave'][packet.mode] || packet.mode
    let team = teams[teamName]
    if (mode === 'add') {
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
      if (mode === 'remove') {
        team.members.forEach(member => {
          delete bot.teamMap[member]
        })
        delete teams[teamName]
        bot.emit('teamRemoved', teams[teamName])
      }
      if (mode === 'change') {
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
        if (mode === 'join') {
          packet.players.forEach((player) => {
            team.add(player)
            bot.teamMap[player] = team
          })
          bot.emit('teamMemberAdded', teams[teamName])
        }
        if (mode === 'leave') {
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
