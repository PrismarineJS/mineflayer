const assert = require('assert')
const { Vec3 } = require('vec3')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Direction numbers: 0=down(-Y), 1=up(+Y), 2=north(-Z), 3=south(+Z), 4=west(-X), 5=east(+X)

  const groundY = bot.test.groundY
  const blockPos = new Vec3(5, groundY + 1, 5)
  const blockPosStr = blockPos.toArray().join(' ')

  // Place a stone block to activate against (lever needs a base, but stone is simpler to test)
  const blockUpdate = once(bot.world, `blockUpdate:(${blockPos.x}, ${blockPos.y}, ${blockPos.z})`)
  bot.chat(`/setblock ${blockPosStr} stone`)
  await blockUpdate
  await bot.test.wait(500)

  // Helper: intercept the next block_place packet and return the direction field
  function captureNextBlockPlaceDirection () {
    return new Promise((resolve) => {
      const origWrite = bot._client.write
      bot._client.write = function (name, data) {
        origWrite.apply(bot._client, arguments)
        if (name === 'block_place') {
          bot._client.write = origWrite
          resolve(data.direction)
        }
      }
    })
  }

  // Test cases: [botPosition, expectedDirection, label]
  // Bot east of block (+X) => should click east face (direction 5)
  // Bot west of block (-X) => should click west face (direction 4)
  // Bot south of block (+Z) => should click south face (direction 3)
  // Bot north of block (-Z) => should click north face (direction 2)
  const testCases = [
    [blockPos.offset(3, 0, 0), 5, 'east (+X)'],
    [blockPos.offset(-3, 0, 0), 4, 'west (-X)'],
    [blockPos.offset(0, 0, 3), 3, 'south (+Z)'],
    [blockPos.offset(0, 0, -3), 2, 'north (-Z)']
  ]

  for (const [botPosition, expectedDir, label] of testCases) {
    await bot.test.teleport(botPosition)
    await bot.test.wait(500)

    const block = bot.blockAt(blockPos)
    assert(block, `Could not find block at ${blockPos}`)

    const dirPromise = captureNextBlockPlaceDirection()
    await bot.activateBlock(block)
    const actualDir = await dirPromise

    bot.test.sayEverywhere(`activateBlock face ${label}: expected=${expectedDir} actual=${actualDir}`)
    assert.strictEqual(actualDir, expectedDir, `Face direction mismatch for ${label}: expected ${expectedDir}, got ${actualDir}`)
  }

  bot.test.sayEverywhere('activateBlock face direction test: pass')
}
