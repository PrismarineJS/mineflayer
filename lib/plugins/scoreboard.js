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

  function removeScore (scoreboard, itemName) {
    if (scoreboard !== undefined) {
      if (!(itemName in scoreboard.itemsMap)) return
      const removed = scoreboard.remove(itemName)
      return bot.emit('scoreRemoved', scoreboard, removed)
    }

    // No objective named: the score is dropped from every objective that holds it.
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
    if (packet.action === 1) return removeScore(scoreboard, packet.itemName)
    if (scoreboard === undefined) return
    const updated = scoreboard.add(packet.itemName, packet.value, packet.display_name)
    bot.emit('scoreUpdated', scoreboard, updated)
  })

  // 1.20.3+. An absent objective name means every objective.
  bot._client.on('reset_score', (packet) => {
    removeScore(packet.objective_name == null ? undefined : scoreboards[packet.objective_name], packet.entity_name)
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

  // No objective or display slot survives a login; the dropped objectives emit no scoreboardDeleted and the objects stay the same.
  bot._client.on('login', () => {
    for (const name of Object.keys(scoreboards)) delete scoreboards[name]
    for (const position of Object.keys(ScoreBoard.positions)) {
      // The named slots are accessors over the numeric slots and must stay.
      if (Object.getOwnPropertyDescriptor(ScoreBoard.positions, position).get) continue
      delete ScoreBoard.positions[position]
    }
  })
}
