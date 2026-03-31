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
    const time = packet.time !== undefined ? longToBigInt(packet.time) : longToBigInt(packet.gameTime)
    const age = packet.age !== undefined ? longToBigInt(packet.age) : (bot.time.bigAge ?? time)
    const doDaylightCycle = packet.tickDayTime !== undefined ? !!packet.tickDayTime : null
    // When doDaylightCycle is false, we need to take the absolute value of time
    const finalTime = doDaylightCycle == null ? time : (doDaylightCycle ? time : (time < 0n ? -time : time))

    bot.time.doDaylightCycle = doDaylightCycle
    bot.time.bigTime = finalTime
    bot.time.time = Number(finalTime)
    bot.time.timeOfDay = bot.time.time % 24000
    bot.time.day = Math.floor(bot.time.time / 24000)
    bot.time.isDay = bot.time.timeOfDay >= 0 && bot.time.timeOfDay < 13000
    bot.time.moonPhase = bot.time.day % 8
    bot.time.bigAge = age
    bot.time.age = Number(age)

    bot.emit('time')
  })
}

function longToBigInt (arr) {
  return BigInt.asIntN(64, (BigInt(arr[0]) << 32n)) | BigInt(arr[1])
}
