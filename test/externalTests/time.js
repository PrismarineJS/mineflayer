const assert = require('assert')
const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test time properties and ranges
  const timeProps = {
    doDaylightCycle: 'boolean',
    bigTime: 'bigint',
    time: 'number',
    timeOfDay: 'number',
    day: 'number',
    isDay: 'boolean',
    moonPhase: 'number',
    bigAge: 'bigint',
    age: 'number'
  }

  // Verify all properties exist and have correct types
  Object.entries(timeProps).forEach(([prop, type]) => {
    assert.strictEqual(typeof bot.time[prop], type, `Property ${prop} should be of type ${type}`)
  })

  // Verify ranges
  assert(bot.time.timeOfDay >= 0 && bot.time.timeOfDay < 24000, 'timeOfDay should be between 0 and 24000')
  assert(bot.time.moonPhase >= 0 && bot.time.moonPhase < 8, 'moonPhase should be between 0 and 7')
  assert(bot.time.day >= 0, 'day should be non-negative')
  assert(bot.time.age >= 0, 'age should be non-negative')
  assert(bot.time.bigAge >= 0n, 'bigAge should be non-negative')

  // Helper functions
  const isTimeClose = (current, target) => Math.abs(current - target) < 510
  const isTimeInRange = (current, start, end) => start <= end ? current >= start && current <= end : current >= start || current <= end
  // One update_time broadcast carries world time AND the doDaylightCycle flag
  // (vanilla builds it in a single `tickCounter % 20` block), so a wait keyed on
  // the state we care about can confirm several commands at once. Waiting on the
  // state also avoids latching onto a broadcast that was already in flight.
  const waitForTimeState = async (matches) =>
    onceWithCleanup(bot, 'time', { timeout: 5000, checkCondition: matches })

  const waitForTime = async (expectedTime) => {
    // Wait for a time event that matches our expectation (if provided)
    // This helps avoid race conditions where we catch an old time update
    if (expectedTime !== undefined) {
      await onceWithCleanup(bot, 'time', {
        timeout: 5000,
        checkCondition: () => isTimeClose(bot.time.timeOfDay, expectedTime)
      })
    } else {
      await once(bot, 'time')
    }
  }

  // Helper to set gamerule using the correct name for the version
  const setDaylightCycle = (value) => {
    if (bot.supportFeature('gameRuleUsesResourceLocation')) {
      bot.test.sayEverywhere(`/gamerule minecraft:advance_time ${value}`)
    } else {
      bot.test.sayEverywhere(`/gamerule doDaylightCycle ${value}`)
    }
  }

  // Disable daylight cycle before time transition tests to prevent
  // time from drifting between /time set and the assertion
  const originalDaylightCycle = bot.time.doDaylightCycle
  // No wait here: the server applies commands in order, so the first /time set
  // below lands after the cycle is off, and its wait confirms both.
  setDaylightCycle(false)

  // Test time transitions
  const timeTests = [
    { time: 18000, name: 'midnight', isDay: false },
    { time: 6000, name: 'noon', isDay: true },
    { time: 12000, name: 'sunset', isDay: true },
    { time: 0, name: 'sunrise', isDay: true }
  ]

  for (const test of timeTests) {
    bot.test.sayEverywhere(`/time set ${test.time}`)
    await waitForTime(test.time)
    assert(isTimeClose(bot.time.timeOfDay, test.time), `Expected time to be close to ${test.time}, got ${bot.time.timeOfDay}`)
    assert.strictEqual(bot.time.isDay, test.isDay, `${test.name} should be ${test.isDay ? 'day' : 'night'}`)
  }

  // Test day and moon phase progression. Capture before mutating, then let one
  // broadcast confirm both the re-enabled cycle and the added day.
  const currentDay = bot.time.day
  const currentPhase = bot.time.moonPhase
  setDaylightCycle(true)
  bot.test.sayEverywhere('/time add 24000')
  // Must key on the day advancing, not just any broadcast: servers that echo
  // each command immediately would otherwise satisfy a bare wait with the
  // gamerule's echo, before the added day is reflected.
  await waitForTimeState(() => bot.time.day >= currentDay + 1)
  assert(bot.time.day >= currentDay + 1, `Expected day to be at least ${currentDay + 1}, got ${bot.time.day}`)
  assert.notStrictEqual(bot.time.moonPhase, currentPhase, 'Moon phase should change after a full day')

  // Test daylight cycle toggle
  setDaylightCycle(false)
  await waitForTimeState(() => bot.time.doDaylightCycle === false)
  assert.strictEqual(bot.time.doDaylightCycle, false)

  setDaylightCycle(originalDaylightCycle)
  await waitForTimeState(() => bot.time.doDaylightCycle === originalDaylightCycle)
  assert.strictEqual(bot.time.doDaylightCycle, originalDaylightCycle)

  // Disable the cycle again for the range tests; no wait, the first /time set
  // below is applied after it and its wait confirms both.
  setDaylightCycle(false)

  // Test day/night transitions
  const dayNightTests = [
    { command: 'day', range: [0, 12000], isDay: true },
    { command: 'night', range: [12000, 24000], isDay: false }
  ]

  for (const test of dayNightTests) {
    bot.test.sayEverywhere(`/time set ${test.command}`)
    await waitForTimeState(() => isTimeInRange(bot.time.timeOfDay, test.range[0], test.range[1]))
    assert(isTimeInRange(bot.time.timeOfDay, test.range[0], test.range[1]), `Time should be in ${test.command} range`)
    assert.strictEqual(bot.time.isDay, test.isDay, `${test.command} should be ${test.isDay ? 'day' : 'night'}`)
  }

  // Restore original daylight cycle setting
  setDaylightCycle(originalDaylightCycle)
  await waitForTime()
}
