const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const groundY = bot.test.groundY

  // Helper: place a dirt block at a position using /setblock
  async function setBlock (pos, blockName) {
    await bot.test.setBlock({ x: pos.x, y: pos.y, z: pos.z, blockName })
  }

  // Helper: measure dig time by actually digging a block
  async function measureDigTime (blockPos) {
    const block = bot.blockAt(blockPos)
    assert(block, `No block found at ${blockPos}`)
    assert.notStrictEqual(block.name, 'air', `Expected a diggable block at ${blockPos}, got air`)
    const start = performance.now()
    await bot.dig(block)
    return performance.now() - start
  }

  // We will work at a position offset from spawn to avoid interfering with other tests
  const testX = 10
  const testZ = 10
  const floorY = groundY
  const blockY = floorY + 1 // block to dig will be at this Y (wall block at bot's level)

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

  // === Test 1: Dig on dry land (baseline) ===
  const digBlockPos = new Vec3(testX + 1, blockY, testZ)

  await setBlock(digBlockPos, 'dirt')
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(300)
  await bot.test.becomeSurvival()
  await bot.test.wait(300)

  const dryDigTime = await measureDigTime(digBlockPos)
  bot.test.sayEverywhere(`Dry dig time: ${dryDigTime.toFixed(0)}ms`)

  // === Test 2: Feet in water, head above water (should NOT be penalized) ===
  await bot.test.becomeCreative()
  // Replace the block we just dug
  await setBlock(digBlockPos, 'dirt')
  // Place water at feet level (floorY + 1), only 1 block high
  // Bot stands at floorY + 1, eyes at ~floorY + 2.62, so water at floorY + 1 only = feet wet, head dry
  await setBlock(new Vec3(testX, floorY + 1, testZ), 'water')
  await bot.test.wait(300)
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(500)
  await bot.test.becomeSurvival()
  await bot.test.wait(300)

  const feetWetDigTime = await measureDigTime(digBlockPos)
  bot.test.sayEverywhere(`Feet-in-water dig time: ${feetWetDigTime.toFixed(0)}ms`)

  // Feet-in-water dig time should be close to dry dig time (within 50% tolerance)
  // and NOT 5x slower like it would be if water penalty applied
  assert(feetWetDigTime < dryDigTime * 2,
    `Feet-in-water dig time (${feetWetDigTime.toFixed(0)}ms) should be similar to dry (${dryDigTime.toFixed(0)}ms), not water-penalized`)

  // === Test 3: Fully submerged (should BE penalized) ===
  await bot.test.becomeCreative()
  // Remove old water, replace block
  await setBlock(new Vec3(testX, floorY + 1, testZ), 'air')
  await bot.test.wait(200)
  await setBlock(digBlockPos, 'dirt')
  // Build a small water column: 3 blocks high so bot is fully submerged
  bot.chat(`/fill ${testX} ${floorY + 1} ${testZ} ${testX} ${floorY + 3} ${testZ} water`)
  await bot.test.wait(500)
  await bot.test.teleport(new Vec3(testX, floorY + 1, testZ))
  await bot.test.wait(500)
  await bot.test.becomeSurvival()
  await bot.test.wait(300)

  const submergedDigTime = await measureDigTime(digBlockPos)
  bot.test.sayEverywhere(`Submerged dig time: ${submergedDigTime.toFixed(0)}ms`)

  // Submerged dig time should be significantly slower (water penalty is 5x)
  assert(submergedDigTime > dryDigTime * 2,
    `Submerged dig time (${submergedDigTime.toFixed(0)}ms) should be much slower than dry (${dryDigTime.toFixed(0)}ms) due to water penalty`)

  // Also verify the relationship: submerged should be much slower than feet-wet
  assert(submergedDigTime > feetWetDigTime * 2,
    `Submerged dig time (${submergedDigTime.toFixed(0)}ms) should be much slower than feet-in-water (${feetWetDigTime.toFixed(0)}ms)`)

  // Cleanup
  await bot.test.becomeCreative()
  bot.chat(`/fill ${testX - 2} ${floorY + 1} ${testZ - 2} ${testX + 2} ${floorY + 4} ${testZ + 2} air`)
  await bot.test.wait(200)

  bot.test.sayEverywhere('digWaterSpeed: all tests passed')
}
