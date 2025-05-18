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
  await bot.test.sayEverywhere('/gamerule doDaylightCycle false')
  await bot.test.wait(500)
  const timePromise = once(bot, 'time')
  bot.test.sayEverywhere('/time set day')
  await timePromise

  // Test time of day transitions
  const midnight = 18000
  const noon = 6000
  const sunset = 12000
  const sunrise = 0

  // Helper function to check if time is close to target with a larger margin
  // Account for 10 ticks (500ms) that pass during the wait
  const isTimeClose = (current, target) => {
    // Allow for up to 500 ticks of drift (25 seconds) plus the 10 ticks from our wait
    return Math.abs(current - target) < 510
  }

  // Helper function to check if time is in a range
  const isTimeInRange = (current, start, end) => {
    if (start <= end) {
      return current >= start && current <= end
    } else {
      // Handle wraparound case (e.g., 23000 to 1000)
      return current >= start || current <= end
    }
  }

  // Test midnight
  bot.test.sayEverywhere(`/time set ${midnight}`)
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert(isTimeClose(bot.time.timeOfDay, midnight), `Expected time to be close to ${midnight}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, false)

  // Test noon
  bot.test.sayEverywhere(`/time set ${noon}`)
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert(isTimeClose(bot.time.timeOfDay, noon), `Expected time to be close to ${noon}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true)

  // Test sunset
  bot.test.sayEverywhere(`/time set ${sunset}`)
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert(isTimeClose(bot.time.timeOfDay, sunset), `Expected time to be close to ${sunset}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true)

  // Test sunrise
  bot.test.sayEverywhere(`/time set ${sunrise}`)
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert(isTimeClose(bot.time.timeOfDay, sunrise), `Expected time to be close to ${sunrise}, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true)

  // Test day increment with verification
  const currentDay = bot.time.day
  bot.test.sayEverywhere('/time add 24000')
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert(bot.time.day >= currentDay + 1, `Expected day to be at least ${currentDay + 1}, got ${bot.time.day}`)

  // Test moon phase with verification
  const currentPhase = bot.time.moonPhase
  bot.test.sayEverywhere('/time add 24000')
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  // Moon phase should change after a full day
  assert.notStrictEqual(bot.time.moonPhase, currentPhase, 'Moon phase should change after a full day')

  // Test daylight cycle
  const originalDaylightCycle = bot.time.doDaylightCycle
  bot.test.sayEverywhere('/gamerule doDaylightCycle false')
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert.strictEqual(bot.time.doDaylightCycle, false)

  // Restore original daylight cycle
  bot.test.sayEverywhere(`/gamerule doDaylightCycle ${originalDaylightCycle}`)
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert.strictEqual(bot.time.doDaylightCycle, originalDaylightCycle)

  // Test isDay logic with time ranges
  const dayStart = 0
  const dayEnd = 12000
  const nightStart = 12000
  const nightEnd = 24000

  // Test day time
  bot.test.sayEverywhere('/time set day')
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  console.log('[test] After /time set day:', 'timeOfDay:', bot.time.timeOfDay, 'isDay:', bot.time.isDay)
  console.log('[test] Right before assertion:', 'timeOfDay:', bot.time.timeOfDay, 'isDay:', bot.time.isDay)
  assert(isTimeInRange(bot.time.timeOfDay, dayStart, dayEnd), 'Time should be in day range')
  assert.strictEqual(bot.time.isDay, true)

  // Test night time
  bot.test.sayEverywhere('/time set night')
  await once(bot, 'time')
  await bot.test.wait(500) // 10 ticks pass here
  assert(isTimeInRange(bot.time.timeOfDay, nightStart, nightEnd), 'Time should be in night range')
  assert.strictEqual(bot.time.isDay, false)
}
