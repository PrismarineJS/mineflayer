const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const groundY = bot.test.groundY

  const testX = 10
  const testZ = 10
  const floorY = groundY
  const blockY = floorY + 1

  // --- Setup: teleport and prepare the area ---
  await bot.test.becomeCreative()
  await bot.test.teleport(new Vec3(testX, floorY + 2, testZ))
  await bot.waitForChunksToLoad()

  // Clear the test area and place a solid floor
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY + 5} ${testZ + 2} air`)
  await bot.test.wait(500)
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY} ${testZ + 2} stone`)
  await bot.test.wait(500)

  // Place a dirt block for digging
  const digBlockPos = new Vec3(testX + 1, blockY, testZ)
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })

  // Teleport bot to the test position
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(500)

  // === Test 1: No water - eye level should not be water ===
  const eyeBlock1 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 1 (dry): eye-level block = ${eyeBlock1?.name ?? 'null'}`)
  assert.notStrictEqual(eyeBlock1?.name, 'water',
    'Eye-level block should not be water when area is dry')

  // === Test 2: Fill water column around bot - eye level should be water ===
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 4} ${testZ} water`)
  await bot.test.wait(500)

  const eyeBlock2 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 2 (submerged): eye-level block = ${eyeBlock2?.name ?? 'null'}`)
  assert.strictEqual(eyeBlock2?.name, 'water',
    `Eye-level block should be water when submerged, got ${eyeBlock2?.name ?? 'null'}`)

  // === Test 3: Remove water, place water only at feet level - eye level should NOT be water ===
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 4} ${testZ} air`)
  await bot.test.wait(300)
  await bot.test.setBlock({ x: testX, y: floorY + 1, z: testZ, blockName: 'water' })
  await bot.test.wait(500)

  const eyeBlock3 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 3 (feet-only water): eye-level block = ${eyeBlock3?.name ?? 'null'}`)
  assert.notStrictEqual(eyeBlock3?.name, 'water',
    'Eye-level block should not be water when only feet are submerged')

  // === Test 4: Verify digTime uses _getBlockAtEyeLevel, not isInWater ===
  // Clear water, ensure clean state
  bot.chat(`/fill ${testX - 1} ${floorY + 1} ${testZ - 1} ${testX + 1} ${floorY + 4} ${testZ + 1} air`)
  await bot.test.wait(300)
  // Restore dirt block
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  await bot.test.wait(300)

  await bot.test.becomeSurvival()
  await bot.test.wait(500)

  // Measure dry dig time
  const block1 = bot.blockAt(digBlockPos)
  assert(block1 && block1.name !== 'air', 'Expected a dirt block to dig')
  const dryDigTime = bot.digTime(block1)

  // Now set isInWater = true but with no actual water blocks at eye level
  // Before the fix, this would have caused a water penalty. After the fix, it should not.
  const origIsInWater = bot.entity.isInWater
  bot.entity.isInWater = true
  const digTimeWithIsInWater = bot.digTime(block1)
  bot.entity.isInWater = origIsInWater

  bot.test.sayEverywhere(`Test 4: dryDigTime=${dryDigTime}, withIsInWater=${digTimeWithIsInWater}`)

  // After the fix, isInWater should NOT affect digTime (only eye-level water matters)
  assert.strictEqual(digTimeWithIsInWater, dryDigTime,
    `isInWater flag should not affect digTime (got ${digTimeWithIsInWater}ms vs dry ${dryDigTime}ms). The fix uses eye-level water check instead.`)

  // Cleanup
  await bot.test.becomeCreative()
  bot.chat(`/fill ${testX - 2} ${floorY + 1} ${testZ - 2} ${testX + 2} ${floorY + 5} ${testZ + 2} air`)
  await bot.test.wait(200)

  bot.test.sayEverywhere('digWaterSpeed: all tests passed')
}
