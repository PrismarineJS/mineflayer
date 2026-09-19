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

  // An absent (or, before 1.20.3, empty) objective name means every objective. A named objective the
  // bot does not know has nothing to remove, so it must not fall through to clearing every objective.
  function removeScore (objectiveName, itemName) {
    if (objectiveName) {
      const scoreboard = scoreboards[objectiveName]
      if (scoreboard === undefined || !(itemName in scoreboard.itemsMap)) return
      const removed = scoreboard.remove(itemName)
      return bot.emit('scoreRemoved', scoreboard, removed)
    }

    for (const sb of Object.values(scoreboards)) {
      if (itemName in sb.itemsMap) {
        const removed = sb.remove(itemName)
        bot.emit('scoreRemoved', sb, removed)
      }
    }
  }

  bot._client.on('scoreboard_score', (packet) => {
    const scoreboard = scoreboards[packet.scoreName]
    // 1.20.3 dropped the action field: the packet only ever sets a score, and a removal arrives as
    // reset_score. Before that, action 1 meant the score was removed and carried no value.
    if (packet.action === 1) return removeScore(packet.scoreName, packet.itemName)
    if (scoreboard === undefined) return
    const updated = scoreboard.add(packet.itemName, packet.value, packet.display_name)
    bot.emit('scoreUpdated', scoreboard, updated)
  })

  // 1.20.3+.
  bot._client.on('reset_score', (packet) => {
    removeScore(packet.objective_name, packet.entity_name)
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
