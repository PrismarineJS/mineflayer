const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const groundY = bot.test.groundY

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

  // Teleport to standing position and wait for landing
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(500)
  await bot.test.becomeSurvival()
  await bot.test.wait(500)

  // === Test 1: digTime on dry land (no water at eye level) ===
  const block1 = bot.blockAt(digBlockPos)
  assert(block1, 'Block at dig position should exist')
  assert.notStrictEqual(block1.name, 'air', 'Block should not be air')
  const dryDigTime = bot.digTime(block1)
  bot.test.sayEverywhere(`Dry digTime: ${dryDigTime}ms`)

  // === Test 2: Place water at eye level and check digTime is slower ===
  await bot.test.becomeCreative()
  // Restore dirt in case anything changed
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  // Build a water column around the bot (3 blocks high so bot is fully submerged)
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 3} ${testZ} water`)
  await bot.test.wait(500)
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(500)
  await bot.test.becomeSurvival()
  await bot.test.wait(500)

  const block2 = bot.blockAt(digBlockPos)
  assert(block2, 'Block at dig position should exist after water placement')
  assert.notStrictEqual(block2.name, 'air', 'Block should not be air after water placement')

  // Check that the eye-level block is actually water
  const eyeLevelBlock = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Eye-level block: ${eyeLevelBlock?.name ?? 'null'} at ${eyeLevelBlock?.position ?? 'unknown'}`)

  const submergedDigTime = bot.digTime(block2)
  bot.test.sayEverywhere(`Submerged digTime: ${submergedDigTime}ms`)

  // The water penalty makes digging 5x slower, so submerged should be significantly slower
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
  await bot.test.wait(500)
  await bot.test.becomeSurvival()
  await bot.test.wait(500)

  const block3 = bot.blockAt(digBlockPos)
  const feetWetDigTime = bot.digTime(block3)
  bot.test.sayEverywhere(`Feet-in-water digTime: ${feetWetDigTime}ms`)

  // Feet in water (but head above water) should NOT apply the water penalty
  // digTime should be the same as dry
  assert.strictEqual(feetWetDigTime, dryDigTime,
    `Feet-in-water digTime (${feetWetDigTime}ms) should equal dry digTime (${dryDigTime}ms) since eyes are not in water`)

  // Also verify submerged is much slower than feet-wet
  assert(submergedDigTime > feetWetDigTime * 2,
    `Submerged digTime (${submergedDigTime}ms) should be much slower than feet-in-water (${feetWetDigTime}ms)`)

  // Cleanup
  await bot.test.becomeCreative()
  bot.chat(`/fill ${testX - 2} ${floorY + 1} ${testZ - 2} ${testX + 2} ${floorY + 4} ${testZ + 2} air`)
  await bot.test.wait(200)

  bot.test.sayEverywhere('digWaterSpeed: all tests passed')
}
