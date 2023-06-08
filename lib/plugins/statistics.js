const { once } = require('events')
module.exports = inject

function inject (bot) {
  async function requestStatistics () {
    if (bot.supportFeature('statisticsUsesPayload')) {
      bot._client.write('client_command', { payload: 1 })
    } else {
      bot._client.write('client_command', { actionId: 1 })
    }

    const packet = await once(bot._client, 'statistics')
    return parseStatisticsPacket(packet)
  }

  function parseStatisticsPacket (packet) {
    const [{ entries: packetData }] = packet
    if (bot.supportFeature('statisticsFormatChanges')) {
      return packetData
    }

    return Object.values(packetData).reduce((acc, { name, value }) => {
      acc[name] = value
      return acc
    }, {})
  }

  bot.requestStatistics = requestStatistics
}
