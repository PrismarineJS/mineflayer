const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const groundY = bot.test.groundY

  const testX = 10
  const testZ = 10
  const floorY = groundY

  // --- Setup: teleport and prepare the area ---
  await bot.test.becomeCreative()
  await bot.test.teleport(new Vec3(testX, floorY + 2, testZ))
  await bot.waitForChunksToLoad()

  // Clear the test area and place a solid floor
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY + 5} ${testZ + 2} air`)
  await bot.test.wait(500)
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY} ${testZ + 2} stone`)
  await bot.test.wait(500)

  // Place a dirt block for digTime testing
  const digBlockPos = new Vec3(testX + 1, floorY + 1, testZ)
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })

  // Teleport bot to the test position
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(500)

  // === Test 1: No water around bot - eye-level block should not be water ===
  const eyeBlock1 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 1 (dry): eye-level block = ${eyeBlock1?.name ?? 'null'}`)
  assert.notStrictEqual(eyeBlock1?.name, 'water',
    'Eye-level block should not be water when area is dry')

  // === Test 2: Fill water column around bot - eye-level block should be water ===
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 4} ${testZ} water`)
  await bot.test.wait(500)

  const eyeBlock2 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 2 (submerged): eye-level block = ${eyeBlock2?.name ?? 'null'}`)
  assert(['water', 'flowing_water'].includes(eyeBlock2?.name),
    `Eye-level block should be water when submerged, got ${eyeBlock2?.name ?? 'null'}`)

  // === Test 3: Verify isInWater flag no longer affects digTime ===
  // This is the core behavior change of this PR: digTime should check the block
  // at eye level instead of using bot.entity.isInWater
  // Clear water and restore dirt
  bot.chat(`/fill ${testX - 1} ${floorY + 1} ${testZ - 1} ${testX + 1} ${floorY + 5} ${testZ + 1} air`)
  await bot.test.wait(500)
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  await bot.test.wait(300)

  await bot.test.becomeSurvival()
  await bot.test.wait(500)

  const block = bot.blockAt(digBlockPos)
  assert(block && block.name !== 'air', 'Expected a dirt block to measure digTime')

  // Measure baseline digTime
  const baselineDigTime = bot.digTime(block)

  // Set isInWater=true without actual water blocks - should NOT change digTime
  const origIsInWater = bot.entity.isInWater
  bot.entity.isInWater = true
  const digTimeWithFlag = bot.digTime(block)
  bot.entity.isInWater = origIsInWater

  bot.test.sayEverywhere(`Test 3: baseline=${baselineDigTime}ms, isInWater=true: ${digTimeWithFlag}ms`)
  assert.strictEqual(digTimeWithFlag, baselineDigTime,
    `isInWater flag should not affect digTime (got ${digTimeWithFlag}ms vs baseline ${baselineDigTime}ms). The PR changes digTime to check eye-level water instead.`)

  // Cleanup
  await bot.test.becomeCreative()
  bot.chat(`/fill ${testX - 2} ${floorY + 1} ${testZ - 2} ${testX + 2} ${floorY + 5} ${testZ + 2} air`)
  await bot.test.wait(200)

  bot.test.sayEverywhere('digWaterSpeed: all tests passed')
}
