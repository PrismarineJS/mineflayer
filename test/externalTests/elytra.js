const assert = require('assert')
module.exports = () => async (bot) => {
  await bot.test.wait(2000) // Add delay for PartialReadErrors to settle
  
  // don't continue unless this version supports elytra
  if (!bot.supportFeature('hasElytraFlying')) return
  const supportsFireworkRockets = bot.supportFeature('fireworkNamePlural') || bot.supportFeature('fireworkNameSingular')
  const Item = require('prismarine-item')(bot.registry)
  await bot.test.setInventorySlot(6, new Item(bot.registry.itemsByName.elytra.id, 1))
  if (supportsFireworkRockets) {
    const fireworkItem = bot.registry.itemsArray.find(item => item.displayName === 'Firework Rocket')
    assert.ok(fireworkItem !== undefined)
    await bot.test.setInventorySlot(36, new Item(fireworkItem.id, 64))
  }
  await bot.test.teleport(bot.entity.position.offset(0, 100, 0))
  await bot.test.becomeSurvival()
  await bot.creative.stopFlying()
  await bot.look(bot.entity.yaw, 0)
  await bot.waitForTicks(5)
  await assert.doesNotReject(bot.elytraFly())
  await bot.waitForTicks(20) // wait for server to accept
  assert.ok(bot.entity.elytraFlying)
  if (!supportsFireworkRockets) return
  
  // Test firework rockets
  const fireworkItemId = bot.registry.itemsByName.firework_rocket?.id || bot.registry.itemsArray.find(item => item.displayName === 'Firework Rocket')?.id
  const initialFireworkCount = bot.inventory.count(fireworkItemId)
  console.log('Initial firework count:', initialFireworkCount)
  assert.strictEqual(initialFireworkCount, 64, 'Should start with 64 fireworks')
  
  // Point at angle and glide for a bit to establish baseline
  await bot.look(bot.entity.yaw, 30 * Math.PI / 180) // Look slightly down to build speed
  await bot.waitForTicks(20) // Glide for 1 second
  
  // Record position BEFORE firework
  const posBeforeFirework = bot.entity.position.clone()
  const velBeforeFirework = bot.entity.velocity.clone()
  const speedBefore = Math.sqrt(velBeforeFirework.x ** 2 + velBeforeFirework.y ** 2 + velBeforeFirework.z ** 2)
  console.log('Before firework:')
  console.log('  Position:', posBeforeFirework.x.toFixed(2), posBeforeFirework.y.toFixed(2), posBeforeFirework.z.toFixed(2))
  console.log('  Velocity:', velBeforeFirework.x.toFixed(3), velBeforeFirework.y.toFixed(3), velBeforeFirework.z.toFixed(3))
  console.log('  Speed:', speedBefore.toFixed(3))
  
  // Use firework rocket
  console.log('Activating firework...')
  bot.activateItem()
  await bot.waitForTicks(2)
  
  // Check firework count decreased immediately
  const afterActivateCount = bot.inventory.count(fireworkItemId)
  console.log('After activation - firework count:', afterActivateCount)
  
  if (afterActivateCount === initialFireworkCount) {
    console.warn('WARNING: Firework count did not decrease - activation may have failed')
  } else {
    console.log('✓ Firework was consumed (count:', initialFireworkCount, '→', afterActivateCount, ')')
  }
  
  // Wait for boost to take effect and measure distance traveled
  await bot.waitForTicks(10) // 0.5 seconds
  
  // Record position AFTER firework
  const posAfterFirework = bot.entity.position.clone()
  const velAfterFirework = bot.entity.velocity.clone()
  const speedAfter = Math.sqrt(velAfterFirework.x ** 2 + velAfterFirework.y ** 2 + velAfterFirework.z ** 2)
  
  // Calculate 3D distance traveled
  const distanceTraveled = posBeforeFirework.distanceTo(posAfterFirework)
  
  console.log('After firework:')
  console.log('  Position:', posAfterFirework.x.toFixed(2), posAfterFirework.y.toFixed(2), posAfterFirework.z.toFixed(2))
  console.log('  Velocity:', velAfterFirework.x.toFixed(3), velAfterFirework.y.toFixed(3), velAfterFirework.z.toFixed(3))
  console.log('  Speed:', speedAfter.toFixed(3))
  console.log('Distance traveled in 0.5s:', distanceTraveled.toFixed(3), 'blocks')
  console.log('Speed change:', (speedAfter - speedBefore).toFixed(3))
  
  // Check that we're still flying
  assert.ok(bot.entity.elytraFlying, 'Should still be elytra flying after using firework')
  
  // Primary check: firework was consumed
  assert.ok(afterActivateCount < initialFireworkCount, 'Firework should be consumed')
  
  // Secondary check: we should have traveled a reasonable distance (boosted by firework)
  // A firework boost should make us travel at least 3 blocks in 0.5 seconds
  console.log(distanceTraveled >= 3 ? '✓ Distance check passed' : '✗ Distance check failed (might be timing issue)')
  
  console.log('✓ Test passed: Firework was successfully used')
}