const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test time properties
  assert.strictEqual(typeof bot.time.doDaylightCycle, 'boolean')
  assert.strictEqual(typeof bot.time.bigTime, 'bigint')
  assert.strictEqual(typeof bot.time.time, 'number')
  assert.strictEqual(typeof bot.time.timeOfDay, 'number')
  assert.strictEqual(typeof bot.time.day, 'number')
  assert.strictEqual(typeof bot.time.isDay, 'boolean')
  assert.strictEqual(typeof bot.time.moonPhase, 'number')
  assert.strictEqual(typeof bot.time.bigAge, 'bigint')
  assert.strictEqual(typeof bot.time.age, 'number')

  // Test time ranges
  assert(bot.time.timeOfDay >= 0 && bot.time.timeOfDay < 24000)
  assert(bot.time.moonPhase >= 0 && bot.time.moonPhase < 8)
  assert(bot.time.day >= 0)
  assert(bot.time.age >= 0)
  assert(bot.time.bigAge >= 0n)

  // Test time events
  const timePromise = once(bot, 'time')
  bot.test.sayEverywhere('/time set day')
  await timePromise

  // Test time of day transitions
  const midnight = 18000
  const noon = 6000
  const sunset = 12000
  const sunrise = 0

  // Helper function to check if time is close to target
  const isTimeClose = (current, target) => {
    return Math.abs(current - target) < 100
  }

  // Test midnight
  bot.test.sayEverywhere(`/time set ${midnight}`)
  await once(bot, 'time')
  assert(isTimeClose(bot.time.timeOfDay, midnight), `Expected time to be close to ${midnight}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, false)

  // Test noon
  bot.test.sayEverywhere(`/time set ${noon}`)
  await once(bot, 'time')
  assert(isTimeClose(bot.time.timeOfDay, noon), `Expected time to be close to ${noon}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true)

  // Test sunset
  bot.test.sayEverywhere(`/time set ${sunset}`)
  await once(bot, 'time')
  assert(isTimeClose(bot.time.timeOfDay, sunset), `Expected time to be close to ${sunset}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true)

  // Test sunrise
  bot.test.sayEverywhere(`/time set ${sunrise}`)
  await once(bot, 'time')
  assert(isTimeClose(bot.time.timeOfDay, sunrise), `Expected time to be close to ${sunrise}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true)

  // Test day increment
  const currentDay = bot.time.day
  bot.test.sayEverywhere('/time add 24000')
  await once(bot, 'time')
  assert.strictEqual(bot.time.day, currentDay + 1)

  // Test moon phase
  const currentPhase = bot.time.moonPhase
  bot.test.sayEverywhere('/time add 24000')
  await once(bot, 'time')
  // Moon phase should change after a full day
  assert.notStrictEqual(bot.time.moonPhase, currentPhase)

  // Test daylight cycle
  const originalDaylightCycle = bot.time.doDaylightCycle
  bot.test.sayEverywhere('/gamerule doDaylightCycle false')
  await once(bot, 'time')
  assert.strictEqual(bot.time.doDaylightCycle, false)

  // Restore original daylight cycle
  bot.test.sayEverywhere(`/gamerule doDaylightCycle ${originalDaylightCycle}`)
  await once(bot, 'time')
  assert.strictEqual(bot.time.doDaylightCycle, originalDaylightCycle)
}
