module.exports = inject

const DAY_TICKS = 24000
const NIGHT_START_TICK = 13000
const MOON_PHASES = 8
// Vanilla's day and moon timelines are both tied to the overworld clock, so that is
// the clock driving the legacy bot.time fields: day, moonPhase and isDay only mean
// anything for it, and the nether has no clock of its own at all.
const PRIMARY_CLOCK = 'overworld'
const WORLD_CLOCK_REGISTRY = 'minecraft:world_clock'

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

  // 26.1+ clockUpdates identify a clock by its index in the world_clock registry, which
  // is only known once the server has sent its registries during configuration.
  // Names are stripped of the minecraft: prefix to match bot.game.dimension.
  let clockNames = []
  bot._client.on('registry_data', (packet) => {
    if (packet?.id !== WORLD_CLOCK_REGISTRY) return
    clockNames = packet.entries.map(entry => entry.key.replace('minecraft:', ''))
  })

  bot._client.on('update_time', (packet) => {
    const age = longToBigInt(packet.age)
    bot.time.bigAge = age
    bot.time.age = Number(age)

    if (packet.clockUpdates) {
      for (const update of packet.clockUpdates) {
        // Only the clocks that changed are sent, so the others have to keep their state.
        // Copied instead of stored by reference because physicsTick below advances them.
        bot.time.clocks[clockNames[update.id] ?? `unknown_clock_${update.id}`] = { ...update }
      }
      applyPrimaryClock()
    } else {
      const time = longToBigInt(packet.time)
      const doDaylightCycle = (packet.tickDayTime !== undefined) ? !!packet.tickDayTime : time >= 0n
      // When doDaylightCycle is false, we need to take the absolute value of time
      applyTime(doDaylightCycle ? time : (time < 0n ? -time : time), doDaylightCycle)
    }

    bot.emit('time')
  })

  // The server only sends update_time periodically, but every clock carries a rate and a
  // partial tick so the client is expected to keep them running in between.
  bot.on('physicsTick', () => {
    let advanced = false
    for (const clock of Object.values(bot.time.clocks)) {
      if (!clock.rate) continue
      clock.partialTick += clock.rate
      const fullTicks = Math.floor(clock.partialTick)
      if (fullTicks === 0) continue
      clock.partialTick -= fullTicks
      clock.totalTicks += fullTicks
      advanced = true
    }
    // The derived fields have to follow, otherwise bot.time.timeOfDay would disagree
    // with bot.time.clocks until the next packet arrives
    if (advanced) applyPrimaryClock()
  })

  function applyPrimaryClock () {
    const clock = bot.time.clocks[PRIMARY_CLOCK] ?? lowestIdClock()
    if (clock) applyTime(BigInt(clock.totalTicks), clock.rate > 0)
  }

  // Fallback for datapacks that rename or remove the vanilla overworld clock
  function lowestIdClock () {
    let lowest = null
    for (const clock of Object.values(bot.time.clocks)) {
      if (lowest === null || clock.id < lowest.id) lowest = clock
    }
    return lowest
  }

  function applyTime (time, doDaylightCycle) {
    bot.time.doDaylightCycle = doDaylightCycle
    bot.time.bigTime = time
    bot.time.time = Number(time)
    bot.time.timeOfDay = bot.time.time % DAY_TICKS
    bot.time.day = Math.floor(bot.time.time / DAY_TICKS)
    bot.time.isDay = bot.time.timeOfDay >= 0 && bot.time.timeOfDay < NIGHT_START_TICK
    bot.time.moonPhase = bot.time.day % MOON_PHASES
  }
}

function longToBigInt (arr) {
  // i64 is read as a [high, low] pair of signed int32s, so the low word has to be masked
  // back to unsigned before it is merged in, otherwise its sign extension wipes the high word
  return BigInt.asIntN(64, (BigInt(arr[0]) << 32n) | (BigInt(arr[1]) & 0xFFFFFFFFn))
}
