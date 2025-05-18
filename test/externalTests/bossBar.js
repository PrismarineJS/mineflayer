const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  console.log('[bossBar test] Starting boss bar tests')

  // Test boss bar creation
  const createBossBar = async () => {
    const uuid = 'test:bar1'
    const title = 'Test Boss Bar'
    const health = 0.5
    const color = 'red'
    const style = 'notched_6'
    const flags = 0

    bot.test.sayEverywhere(`/bossbar add ${uuid} "${title}"`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} players ${bot.username}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} color ${color}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} style ${style}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} value ${health * 100}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} visible true`)

    // Wait for the boss bar to be created
    const bossBar = await once(bot, 'bossBarCreated')
    assert.strictEqual(bossBar.title?.toString(), title)
    assert.strictEqual(bossBar.health, health)
    assert.strictEqual(bossBar.color, color)
    assert.strictEqual(bossBar.dividers, style)
    assert.strictEqual(bossBar.flags, flags)
  }

  // Test boss bar update
  const updateBossBar = async () => {
    const uuid = 'test:bar1'
    const newHealth = 0.75
    const newColor = 'blue'
    const newStyle = 'notched_10'

    bot.test.sayEverywhere(`/bossbar set ${uuid} color ${newColor}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} style ${newStyle}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} value ${newHealth * 100}`)

    // Wait for the update event
    const bossBar = await once(bot, 'bossBarUpdated')
    assert.strictEqual(bossBar.health, newHealth)
    assert.strictEqual(bossBar.color, newColor)
    assert.strictEqual(bossBar.dividers, newStyle)
  }

  // Test boss bar deletion
  const deleteBossBar = async () => {
    const uuid = 'test:bar1'
    bot.test.sayEverywhere(`/bossbar remove ${uuid}`)
    await once(bot, 'bossBarDeleted')
    assert.strictEqual(bot.bossBars.length, 0)
  }

  try {
    await createBossBar()
    await updateBossBar()
    await deleteBossBar()
    console.log('[bossBar test] All tests passed!')
  } catch (err) {
    console.error('[bossBar test] Test failed:', err)
    throw err
  }
} 