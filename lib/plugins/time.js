module.exports = inject

function inject (bot) {
  bot.time = {
    doDaylightCycle: null,
    bigTime: null,
    time: null,
    timeOfDay: null,
    day: null,
    isDay: null,
    moonPhase: null,
    bigAge: null,
    age: null
  }
  bot._client.on('update_time', (packet) => {
    let time = longToBigInt(packet.time)

    if (time < 0) {
      bot.time.doDaylightCycle = false
      time *= -1n
    } else {
      bot.time.doDaylightCycle = true
    }

    bot.time.bigTime = time
    bot.time.time = Number(time)
    bot.time.timeOfDay = bot.time.time % 24000
    bot.time.day = Math.floor(bot.time.time / 24000)
    bot.time.isDay = bot.time.timeOfDay < 13000 || bot.time.timeOfDay >= 23000
    bot.time.moonPhase = bot.time.day % 8
    bot.time.bigAge = longToBigInt(packet.age)
    bot.time.age = Number(bot.time.bigAge)

    bot.emit('time')
  })
}

function longToBigInt (arr) {
  return BigInt.asIntN(64, (BigInt(arr[0]) << 32n)) | BigInt(arr[1])
}
