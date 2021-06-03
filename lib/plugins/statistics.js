const { once } = require('events')
module.exports = inject

function inject (bot) {
  function parseStatisticsPacket (packet) {
    const [{ entries: packetData }] = packet
    if (bot.supportFeature('statisticsFormatChanges')) {
      return packetData
    }

    const data = {}
    Object.values(packetData).forEach(({ name, value }) => {
      data[name] = value
    })
    return data
  }
  async function requestStatistics () {
    if (bot.supportFeature('statisticsUsesPayload')) {
      bot._client.write('client_command', { payload: 1 })
    } else {
      bot._client.write('client_command', { actionId: 1 })
    }

    const packet = await once(bot._client, 'statistics')
    const data = parseStatisticsPacket(packet)
    console.log(data)
    return packet
  }
  bot.requestStatistics = requestStatistics
}
