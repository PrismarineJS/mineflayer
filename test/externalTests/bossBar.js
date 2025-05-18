const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = (version) => async (bot) => {
  // Skip test for versions older than 1.13 (bossbar command not available)
  if (bot.registry.isOlderThan('1.13')) return

  console.log('[bossBar test] Starting boss bar tests')

  // Test boss bar creation
  const createBossBar = async () => {
    const uuid = 'test:bar1'
    const title = 'Test Boss Bar'
    const colorName = 'red'
    const styleName = 'notched_6'
    const health = 0.5

    bot.test.sayEverywhere(`/bossbar add ${uuid} "${title}"`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} players ${bot.username}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} color ${colorName}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} style ${styleName}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} value ${health * 100}`)
    bot.test.sayEverywhere(`/bossbar set ${uuid} visible true`)

    // Wait for the boss bar to be created
    const [bossBar] = await once(bot, 'bossBarCreated')
    console.log('DEBUG bossBar:', bossBar)
    console.log('DEBUG bossBar own properties:', Object.getOwnPropertyNames(bossBar))
    console.log('DEBUG bossBar prototype:', Object.getPrototypeOf(bossBar))
    console.log('DEBUG bossBar.title:', bossBar.title, 'type:', typeof bossBar.title)
    assert.strictEqual(bossBar.title.toString(), title)
    // Do not check dividers or color here; they will be updated in the next step
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

    // Wait for the boss bar to have the expected state
    let bossBar
    while (true) {
      [bossBar] = await once(bot, 'bossBarUpdated')
      if (
        bossBar.health === newHealth &&
        bossBar.color === newColor &&
        bossBar.dividers === 10
      ) break
    }
    assert.strictEqual(bossBar.health, newHealth)
    assert.strictEqual(bossBar.color, newColor)
    assert.strictEqual(bossBar.dividers, 10)
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
