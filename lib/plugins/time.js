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
    let time
    let age
    let doDaylightCycle

    // 26.1+: { age/gameTime, clockUpdates:[{id,totalTicks,partialTick,rate}] }
    // older: { age, time, tickDayTime? }
    if (packet.clockUpdates) {
      age = longToBigInt(packet.gameTime ?? packet.age ?? 0)
      const clockId = bot.game?.dimension === 'the_end' ? 1 : 0
      const clockUpdate = packet.clockUpdates.find(c => (c.id ?? c.clock) === clockId) ?? packet.clockUpdates[0]
      time = longToBigInt(clockUpdate?.totalTicks ?? 0)
      doDaylightCycle = clockUpdate ? clockUpdate.rate !== 0 : true
    } else {
      time = longToBigInt(packet.time)
      age = longToBigInt(packet.age)
      doDaylightCycle = packet.tickDayTime !== undefined ? !!packet.tickDayTime : time >= 0n
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
}

function longToBigInt (arr) {
  if (typeof arr === 'bigint') return arr
  if (typeof arr === 'number') return BigInt(arr)
  if (arr == null) return 0n
  if (Array.isArray(arr)) {
    return BigInt.asIntN(64, (BigInt(arr[0]) << 32n) | BigInt(arr[1] >>> 0))
  }
  if (typeof arr === 'object' && ('high' in arr || 'low' in arr)) {
    return BigInt.asIntN(64, (BigInt(arr.high) << 32n) | BigInt(arr.low >>> 0))
  }
  return BigInt(arr)
}
