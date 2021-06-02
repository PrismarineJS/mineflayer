module.exports = inject

function inject (bot) {
  async function requestStatistics () {
    if (bot.supportFeature('usesPayload')) {
      bot._client.write('client_command', { payload: 1 })
    } else { bot._client.write('client_command', { actionId: 1 }) }

    bot._client.once('statistics', parseStatistics)

    function parseStatistics (packet) {
      const parsedPacket = {}

      packet.entries.forEach(function (statistic) {
        parsedPacket[statistic.name] = statistic.value
      })

      bot._client.removeListener('statistics', parseStatistics)
      return parsedPacket
      }
    })
  }

  bot.requestStatistics = requestStatistics
}
