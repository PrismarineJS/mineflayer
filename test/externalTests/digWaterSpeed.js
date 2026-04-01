const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const groundY = bot.test.groundY

  // Helper: wait until the bot is on the ground
  async function waitForOnGround (timeoutMs = 5000) {
    if (bot.entity.onGround) return
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        bot.removeListener('move', onMove)
        reject(new Error('Timed out waiting for bot to land on ground'))
      }, timeoutMs)
      function onMove () {
        if (bot.entity.onGround) {
          clearTimeout(timer)
          bot.removeListener('move', onMove)
          resolve()
        }
      }
      bot.on('move', onMove)
    })
  }

  // We will work at a position offset from spawn to avoid interfering with other tests
  const testX = 10
  const testZ = 10
  const floorY = groundY
  const blockY = floorY + 1

  // --- Setup: teleport and prepare the area ---
  await bot.test.becomeCreative()
  await bot.test.teleport(new Vec3(testX, floorY + 2, testZ))
  await bot.waitForChunksToLoad()

  // Clear the test area
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY + 4} ${testZ + 2} air`)
  await bot.test.wait(500)
  // Place a solid floor
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY} ${testZ + 2} stone`)
  await bot.test.wait(500)

  // Place dirt block to test digTime against
  const digBlockPos = new Vec3(testX + 1, blockY, testZ)
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })

  // Teleport to standing position and wait for the bot to land
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.becomeSurvival()
  await bot.test.wait(500)
  await waitForOnGround()

  // === Test 1: digTime on dry land (no water at eye level) ===
  assert(bot.entity.onGround, 'Bot should be on ground for dry test')
  const block1 = bot.blockAt(digBlockPos)
  assert(block1, 'Block at dig position should exist')
  assert.notStrictEqual(block1.name, 'air', 'Block should not be air')
  const dryDigTime = bot.digTime(block1)
  bot.test.sayEverywhere(`Dry digTime: ${dryDigTime}ms (onGround=${bot.entity.onGround})`)

  // === Test 2: Place water at eye level and check digTime is slower ===
  await bot.test.becomeCreative()
  // Restore dirt in case anything changed
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  // Build a water column around the bot (3 blocks high so bot is fully submerged)
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 3} ${testZ} water`)
  await bot.test.wait(500)
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)

  const block2 = bot.blockAt(digBlockPos)
  assert(block2, 'Block at dig position should exist after water placement')
  assert.notStrictEqual(block2.name, 'air', 'Block should not be air after water placement')

  // Check that the eye-level block is actually water
  const eyeLevelBlock = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Eye-level block: ${eyeLevelBlock?.name ?? 'null'} (onGround=${bot.entity.onGround})`)

  const submergedDigTime = bot.digTime(block2)
  bot.test.sayEverywhere(`Submerged digTime: ${submergedDigTime}ms`)

  // The water penalty makes digging 5x slower
  // Even if onGround differs between dry and submerged, the water penalty should add extra slowdown
  assert(submergedDigTime > dryDigTime,
    `Submerged digTime (${submergedDigTime}ms) should be greater than dry (${dryDigTime}ms)`)

  // === Test 3: Feet in water but head above water should NOT penalize ===
  await bot.test.becomeCreative()
  // Clear the water column
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 3} ${testZ} air`)
  await bot.test.wait(300)
  // Place water only at feet level (1 block high)
  await bot.test.setBlock({ x: testX, y: floorY + 1, z: testZ, blockName: 'water' })
  await bot.test.wait(300)
  // Restore dirt
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)

  const block3 = bot.blockAt(digBlockPos)
  const feetWetDigTime = bot.digTime(block3)
  const eyeBlock3 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Feet-in-water digTime: ${feetWetDigTime}ms, eye-level: ${eyeBlock3?.name ?? 'null'} (onGround=${bot.entity.onGround})`)

  // Feet in water (but head above water) should NOT apply the water penalty
  // The eye-level block should NOT be water
  assert.notStrictEqual(eyeBlock3?.name, 'water',
    'Eye-level block should not be water when only feet are in water')

  // Also verify submerged is much slower than feet-wet
  assert(submergedDigTime > feetWetDigTime,
    `Submerged digTime (${submergedDigTime}ms) should be slower than feet-in-water (${feetWetDigTime}ms)`)

  // Cleanup
  await bot.test.becomeCreative()
  bot.chat(`/fill ${testX - 2} ${floorY + 1} ${testZ - 2} ${testX + 2} ${floorY + 4} ${testZ + 2} air`)
  await bot.test.wait(200)

  bot.test.sayEverywhere('digWaterSpeed: all tests passed')
}
