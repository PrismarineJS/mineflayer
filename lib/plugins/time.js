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
    age: null,
    clocks: {}
  }
  bot._client.on('update_time', (packet) => {
    const age = longToBigInt(packet.age)
    let time
    let doDaylightCycle
    if (packet.clockUpdates) {
      for (const update of packet.clockUpdates) {
        bot.time.clocks[bot.registry.dimensionsById[update.id].name] = update
      }
      time = BigInt(bot.time.clocks[bot.game.dimension]?.totalTicks ?? 0)
      doDaylightCycle = bot.time.clocks[bot.game.dimension]?.rate > 0
    } else {
      time = longToBigInt(packet.time)
      doDaylightCycle = (packet.tickDayTime !== undefined) ? !!packet.tickDayTime : time >= 0n
    }
    // When doDaylightCycle is false, we need to take the absolute value of time
    const finalTime = doDaylightCycle ? time : (time < 0n ? -time : time)

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
  bot.on('physicsTick', () => {
    for (const clock of Object.values(bot.time.clocks)) {
      clock.partialTick += clock.rate
      const fullTicks = Math.floor(clock.partialTick)
      clock.partialTick -= fullTicks
      clock.totalTicks += fullTicks
    }
  })
}

function longToBigInt (arr) {
  return BigInt.asIntN(64, (BigInt(arr[0]) << 32n)) | BigInt(arr[1])
}
