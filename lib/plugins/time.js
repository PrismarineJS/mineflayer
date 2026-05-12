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
    const clockUpdate = readClockUpdates(packet.clockUpdates)
    const packetAge = packet.age ?? packet.gameTime ?? packet.time
    if (packetAge == null) return

    const age = longToBigInt(packetAge)
    const previousAge = bot.time.bigAge
    const previousTime = bot.time.bigTime

    let packetTime = packet.time ?? clockUpdate?.time
    const daylightBasis = packetTime ?? packet.gameTime ?? packet.age
    let doDaylightCycle
    if (packet.tickDayTime !== undefined) {
      doDaylightCycle = !!packet.tickDayTime
    } else if (clockUpdate?.tickRate !== undefined) {
      doDaylightCycle = clockUpdate.tickRate > 0
    } else {
      doDaylightCycle = bot.time.doDaylightCycle ?? (longToBigInt(daylightBasis) >= 0n)
    }

    if (packetTime == null && previousTime != null && previousAge != null) {
      const ageDelta = age - previousAge
      packetTime = doDaylightCycle ? previousTime + ageDelta : previousTime
    }
    packetTime ??= packet.gameTime ?? packet.age
    if (packetTime == null) return

    const time = longToBigInt(packetTime)
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

function readClockUpdates (buffer) {
  if (!buffer || buffer.length === 0) return null
  let offset = 0
  const count = readVarInt(buffer, offset)
  offset = count.offset

  for (let i = 0; i < count.value && offset < buffer.length; i++) {
    const type = readVarInt(buffer, offset)
    offset = type.offset
    const time = readVarLong(buffer, offset)
    offset = time.offset
    const tickRate = offset + 8 <= buffer.length ? buffer.readFloatBE(offset + 4) : undefined
    offset += 8

    if (type.value === 0) return { time: time.value, tickRate }
  }
  return null
}

function readVarInt (buffer, offset) {
  let value = 0
  let shift = 0
  let cursor = offset
  while (cursor < buffer.length) {
    const byte = buffer[cursor++]
    value |= (byte & 0x7f) << shift
    if ((byte & 0x80) === 0) return { value, offset: cursor }
    shift += 7
  }
  throw new Error('Invalid varint in update_time clockUpdates')
}

function readVarLong (buffer, offset) {
  let value = 0n
  let shift = 0n
  let cursor = offset
  while (cursor < buffer.length) {
    const byte = buffer[cursor++]
    value |= BigInt(byte & 0x7f) << shift
    if ((byte & 0x80) === 0) return { value: BigInt.asIntN(64, value), offset: cursor }
    shift += 7n
  }
  throw new Error('Invalid varlong in update_time clockUpdates')
}

function longToBigInt (arr) {
  if (typeof arr === 'bigint') return BigInt.asIntN(64, arr)
  if (typeof arr === 'number') return BigInt.asIntN(64, BigInt(arr))
  return BigInt.asIntN(64, (BigInt(arr[0]) << 32n)) | BigInt(arr[1])
}
