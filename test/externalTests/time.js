const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

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
  // update_time is the only carrier of world time and doDaylightCycle, and
  // vanilla broadcasts it once every 20 ticks, so each wait costs a full tick
  // interval on servers that do not echo commands.
  const waitForTimeState = async (matches) =>
    onceWithCleanup(bot, 'time', { timeout: 5000, checkCondition: matches })

  // The gamerule is renamed on versions with gameRuleUsesResourceLocation.
  const sendSetDaylightCycleCommand = (value) => {
    if (bot.supportFeature('gameRuleUsesResourceLocation')) {
      bot.test.sayEverywhere(`/gamerule minecraft:advance_time ${value}`)
    } else {
      bot.test.sayEverywhere(`/gamerule doDaylightCycle ${value}`)
    }
  }

  // Disable daylight cycle before time transition tests to prevent
  // time from drifting between /time set and the assertion
  const originalDaylightCycle = bot.time.doDaylightCycle

  // Night with the cycle off: covers isDay false and doDaylightCycle false.
  sendSetDaylightCycleCommand(false)
  bot.test.sayEverywhere('/time set 18000')
  await waitForTimeState(() => isTimeClose(bot.time.timeOfDay, 18000))
  assert(isTimeClose(bot.time.timeOfDay, 18000), `Expected time to be close to 18000, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, false, 'midnight should be night')
  assert.strictEqual(bot.time.doDaylightCycle, false)

  // 12000 is the last tick that still counts as day.
  bot.test.sayEverywhere('/time set 12000')
  await waitForTimeState(() => isTimeClose(bot.time.timeOfDay, 12000))
  assert(isTimeClose(bot.time.timeOfDay, 12000), `Expected time to be close to 12000, got ${bot.time.timeOfDay}`)
  assert.strictEqual(bot.time.isDay, true, 'sunset should be day')

  // Day and moon phase progression, and doDaylightCycle true.
  // Must be read before the commands below mutate them.
  const currentDay = bot.time.day
  const currentPhase = bot.time.moonPhase
  sendSetDaylightCycleCommand(true)
  bot.test.sayEverywhere('/time add 24000')
  await waitForTimeState(() => bot.time.day >= currentDay + 1)
  assert(bot.time.day >= currentDay + 1, `Expected day to be at least ${currentDay + 1}, got ${bot.time.day}`)
  assert.notStrictEqual(bot.time.moonPhase, currentPhase, 'Moon phase should change after a full day')
  assert.strictEqual(bot.time.doDaylightCycle, true)

  // Restore for later tests; the server applies it without the client waiting.
  sendSetDaylightCycleCommand(originalDaylightCycle)
}
