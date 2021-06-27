module.exports = inject

function inject (bot) {
  const Team = require('../team')(bot.version)
  const teams = {}

  function teamHandler (packet) {
    const { team: teamName, mode } = packet
    let team = teams[teamName]
    if (mode === 0) {
      team = new Team(packet)
      if (Array.isArray(packet.players)) {
        packet.players.forEach(player => team.add(player))
      }
      teams[teamName] = team
      bot.emit('teamCreated', teams[teamName])
    }
    if (team !== undefined) {
      if (mode === 1) {
        bot.emit('teamRemoved', teams[teamName])
        delete teams[teamName]
      }
      if (mode === 2) {
        team.update(packet)
        bot.emit('teamUpdated', teams[teamName])
      }
      if (Array.isArray(packet.players)) {
        if (mode === 3) {
          packet.players.forEach((player) => {
            team.add(player)
            // add to player
          })
          bot.emit('teamMemberAdded', teams[teamName])
        }
        if (mode === 4) {
          packet.players.forEach((player) => {
            team.remove(player)
          })
          bot.emit('teamMemberRemoved', teams[teamName])
        }
      }
    }
  }

  if (bot.supportFeature('teamUsesChatComponents')) {
    bot._client.on('teams', teamHandler)
  } else {
    bot._client.on('scoreboard_team', teamHandler)
  }

  bot.teams = teams
}
