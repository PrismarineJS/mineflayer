module.exports = inject

function inject (bot) {
  bot.time = {
    day: null,
    age: null
  }
  bot._client.on('update_time', (packet) => {
    bot.time.time = longToNumber(packet.time)
    bot.time.timeOfDay = bot.time.time % 24000
    bot.time.day = Math.floor(bot.time.time / 24000)
    bot.time.isDay = bot.time.timeOfDay < 13000 || bot.time.timeOfDay >= 23000
    bot.time.moonPhase = bot.time.day % 8
    bot.time.age = longToNumber(packet.age)
    bot.emit('time')
  })
}

function longToNumber (arr) {
  return arr[1] + 4294967296 * arr[0]
}
