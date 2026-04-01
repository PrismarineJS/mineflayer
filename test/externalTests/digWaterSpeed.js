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
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY + 5} ${testZ + 2} air`)
  await bot.test.wait(500)
  // Place a solid floor
  bot.chat(`/fill ${testX - 2} ${floorY} ${testZ - 2} ${testX + 2} ${floorY} ${testZ + 2} stone`)
  await bot.test.wait(500)

  // Place dirt block to test digTime against
  const digBlockPos = new Vec3(testX + 1, blockY, testZ)
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })

  // Teleport bot and switch to survival. The bot position and onGround state
  // will remain the same across all sub-tests (we only change blocks around the bot).
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)

  // Record the current state for diagnostics
  const onGround = bot.entity.onGround
  bot.test.sayEverywhere(`Bot state: onGround=${onGround}, pos=${bot.entity.position}`)

  // === Test 1: digTime on dry land (no water at eye level) ===
  const eyeBlock1 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 1 eye-level: ${eyeBlock1?.name ?? 'null'}`)
  assert.notStrictEqual(eyeBlock1?.name, 'water', 'Eye level should not be water in dry test')

  const block1 = bot.blockAt(digBlockPos)
  assert(block1, 'Block at dig position should exist')
  assert.notStrictEqual(block1.name, 'air', 'Block should not be air')
  const dryDigTime = bot.digTime(block1)
  bot.test.sayEverywhere(`Dry digTime: ${dryDigTime}ms`)

  // === Test 2: Place water at eye level using /setblock (don't move the bot) ===
  // Eye height is 1.62, so eye level Y = floorY + 1 + 1.62 = floorY + 2.62
  // The block at eye level is at Y = floorY + 2 (integer position)
  const eyeLevelY = floorY + 2
  // Also fill one above to ensure full water column around eye level
  await bot.test.becomeCreative()
  // Restore dirt (becomeCreative doesn't move bot)
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  // Place water at bot position and at eye level
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 4} ${testZ} water`)
  await bot.test.wait(500)
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)

  const eyeBlock2 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 2 eye-level: ${eyeBlock2?.name ?? 'null'}, onGround=${bot.entity.onGround}`)

  // Verify water is at eye level
  assert.strictEqual(eyeBlock2?.name, 'water',
    `Expected water at eye level, got ${eyeBlock2?.name ?? 'null'}`)

  const block2 = bot.blockAt(digBlockPos)
  assert(block2, 'Block should exist after water placement')
  assert.notStrictEqual(block2.name, 'air', 'Block should not be air')
  const submergedDigTime = bot.digTime(block2)
  bot.test.sayEverywhere(`Submerged digTime: ${submergedDigTime}ms`)

  // Submerged dig time must be strictly greater than dry dig time
  // The water penalty is 5x, so even with onGround differences, this should hold
  assert(submergedDigTime > dryDigTime,
    `Submerged digTime (${submergedDigTime}ms) should be greater than dry (${dryDigTime}ms)`)

  // === Test 3: Water only at feet level (not at eye level) should NOT add water penalty ===
  await bot.test.becomeCreative()
  // Clear water
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 4} ${testZ} air`)
  await bot.test.wait(300)
  // Place water only at feet level
  await bot.test.setBlock({ x: testX, y: floorY + 1, z: testZ, blockName: 'water' })
  await bot.test.wait(300)
  // Restore dirt
  await bot.test.setBlock({ x: digBlockPos.x, y: digBlockPos.y, z: digBlockPos.z, blockName: 'dirt' })
  await bot.test.becomeSurvival()
  await bot.test.wait(1000)

  const eyeBlock3 = bot._getBlockAtEyeLevel()
  bot.test.sayEverywhere(`Test 3 eye-level: ${eyeBlock3?.name ?? 'null'}, onGround=${bot.entity.onGround}`)

  // Eye level should NOT be water
  assert.notStrictEqual(eyeBlock3?.name, 'water',
    'Eye level should not be water when only feet are in water')

  const block3 = bot.blockAt(digBlockPos)
  const feetWetDigTime = bot.digTime(block3)
  bot.test.sayEverywhere(`Feet-in-water digTime: ${feetWetDigTime}ms`)

  // Submerged should be slower than feet-in-water
  assert(submergedDigTime > feetWetDigTime,
    `Submerged digTime (${submergedDigTime}ms) should be slower than feet-in-water (${feetWetDigTime}ms)`)

  // Cleanup
  await bot.test.becomeCreative()
  bot.chat(`/fill ${testX - 2} ${floorY + 1} ${testZ - 2} ${testX + 2} ${floorY + 5} ${testZ + 2} air`)
  await bot.test.wait(200)

  bot.test.sayEverywhere('digWaterSpeed: all tests passed')
}
