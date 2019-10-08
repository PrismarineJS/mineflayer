const ScoreBoard = require('../scoreboard')

module.exports = inject

function inject (bot) {
  const scoreboards = {}
  const teams = {}

  bot._client.on('scoreboard_objective', (packet) => {
    if (packet.action === 0) {
      const { name } = packet
      const scoreboard = new ScoreBoard(packet)
      scoreboards[name] = scoreboard

      bot.emit('scoreboardCreated', scoreboard)
    }

    if (packet.action === 1) {
      bot.emit('scoreboardDeleted', scoreboards[packet.name])
      delete scoreboards[packet.name]
    }

    if (packet.action === 2) {
      scoreboards[packet.name].title = packet.displayText
      bot.emit('scoreboardTitleChanged', scoreboards[packet.name])
    }
  })

  bot._client.on('scoreboard_score', (packet) => {
    const scoreboard = scoreboards[packet.scoreName]
    if (scoreboard !== undefined && packet.action === 0) {
      const updated = scoreboard.add(packet.itemName, packet.value)
      bot.emit('scoreUpdated', scoreboard, updated)
    }

    if (packet.action === 1) {
      if (scoreboard !== undefined) {
        const removed = scoreboard.remove(packet.itemName)
        return bot.emit('scoreRemoved', scoreboard, removed)
      }

      for (const sb of Object.values(scoreboards)) {
        if (packet.itemName in sb.itemsMap) {
          const removed = sb.remove(packet.itemName)
          return bot.emit('scoreRemoved', sb, removed)
        }
      }
    }
  })

  bot._client.on('scoreboard_display_objective', (packet) => {
    const { name, position } = packet
    const scoreboard = scoreboards[name]

    if (scoreboard !== undefined) {
      bot.emit('scoreboardPosition', position, scoreboard, ScoreBoard.positions[position])
      ScoreBoard.positions[position] = scoreboard
    }
  })

  bot.on('teams', (packet) => {
    if (packet.mode === 0) {
      let team = {};
      team.displayName = packet.name
      team.prefix = packet.prefix
      team.suffix = packet.suffix
      team.friendlyFire = packet.friendlyFire
      team.nameTagVisibility = packet.nameTagVisibility
      team.collisionRule = packet.collisionRule
      team.color = packet.color
      team.players = packet.players
      teams[packet.team] = team
    }

    if (packet.mode === 1) {
      delete teams[packet.team]
    }

    if (packet.mode === 2) {
      if (teams[packet.team] === undefined) return
      teams[packet.team].displayName = packet.name
      teams[packet.team].prefix = packet.prefix
      teams[packet.team].suffix = packet.suffix
      teams[packet.team].friendlyFire = packet.friendlyFire
      teams[packet.team].nameTagVisibility = packet.nameTagVisibility
      teams[packet.team].collisionRule = packet.collisionRule
      teams[packet.team].color = packet.color
    }

    if (packet.mode === 3) {
            if (teams[packet.team] === undefined) return
            teams[packet.team].players = teams[packet.team].players.concat(packet.players)
    }

    if (packet.mode === 4) {
            if (teams[packet.team] === undefined) return
            teams[packet.team].players = teams[packet.team].players.filter((el) => !packet.players.includes(el))
    }
  })

  bot.scoreboards = scoreboards
  bot.scoreboard = ScoreBoard.positions
  bot.teams = teams
}
