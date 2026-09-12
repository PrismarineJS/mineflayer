module.exports = inject

function inject (bot) {
  const ScoreBoard = require('../scoreboard')(bot)
  const scoreboards = {}

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

      for (const position in ScoreBoard.positions) {
        if (!ScoreBoard.positions[position]) continue
        const scoreboard = ScoreBoard.positions[position]

        if (scoreboard && scoreboard.name === packet.name) {
          delete ScoreBoard.positions[position]
          break
        }
      }
    }

    if (packet.action === 2) {
      if (!Object.hasOwn(scoreboards, packet.name)) {
        bot.emit('error', new Error(`Received update for unknown objective ${packet.name}`))
        return
      }
      scoreboards[packet.name].setTitle(packet.displayText)
      bot.emit('scoreboardTitleChanged', scoreboards[packet.name])
    }
  })

  bot._client.on('scoreboard_score', (packet) => {
    const scoreboard = scoreboards[packet.scoreName]
    // 1.20.3 moved removal into its own reset_score packet, so this packet lost its action
    // field and now only ever sets a score.
    if (packet.action === undefined || packet.action === 0) {
      if (scoreboard === undefined) return
      const updated = scoreboard.add(packet.itemName, packet.value, packet.display_name)
      bot.emit('scoreUpdated', scoreboard, updated)
      return
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

  // 1.20.3+. An absent objective_name resets the entry on every objective, as vanilla does.
  bot._client.on('reset_score', (packet) => {
    const targets = packet.objective_name == null
      ? Object.values(scoreboards)
      : [scoreboards[packet.objective_name]]

    for (const scoreboard of targets) {
      if (scoreboard === undefined || !(packet.entity_name in scoreboard.itemsMap)) continue
      const removed = scoreboard.remove(packet.entity_name)
      bot.emit('scoreRemoved', scoreboard, removed)
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

  bot.scoreboards = scoreboards
  bot.scoreboard = ScoreBoard.positions
}
