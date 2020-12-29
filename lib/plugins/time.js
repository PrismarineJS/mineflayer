module.exports = inject

function inject (bot) {
  bot.time = {
    doDaylightCycle: null,
    time: null,
    timeOfDay: null,
    day: null,
    isDay: null,
    moonPhase: null,
    age: null
  }
  bot._client.on('update_time', (packet) => {
    let time = longToNumber(packet.time)

    if (time < 0) {
      bot.time.doDaylightCycle = false
      time *= -1
    } else {
      bot.time.doDaylightCycle = true
    }

    bot.time.time = time
    bot.time.timeOfDay = bot.time.time % 24000
    bot.time.day = Math.floor(bot.time.time / 24000)
    bot.time.isDay = bot.time.timeOfDay < 13000 || bot.time.timeOfDay >= 23000
    bot.time.moonPhase = bot.time.day % 8
    bot.time.age = longToNumber(packet.age)

    bot.emit('time')
  })
}

function longToNumber (arr) {
  const str = (arr[0] >>> 0).toString(2) + (arr[1] >>> 0).toString(2)
  if (str[0] === '1') {
    // If the first character is a 1, it means the number is negative.
    // To parse the number we first need to split the string to an array.
    // Then we can flip each bit, and join it to a string again.
    // Then the string is parsed to an int using base 2.
    // And lastly the result is negated and subtracted by 1.
    return parseInt(str.split('').map(bit => 1 - bit).join(''), 2) * -1 - 1
  } else {
    return parseInt(str, 2)
  }
}
