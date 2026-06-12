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

  // Helper: intercept the next block_place packet and return its full data
  function captureNextBlockPlace () {
    return new Promise((resolve) => {
      const origWrite = bot._client.write
      bot._client.write = function (name, data) {
        origWrite.apply(bot._client, arguments)
        if (name === 'block_place') {
          bot._client.write = origWrite
          resolve(data)
        }
      }
    })
  }

  // The cursor is scaled by 16 on older versions and raw [0,1] on newer ones.
  // Assert it lands on the reported face.
  const faceAxis = ['y', 'y', 'z', 'z', 'x', 'x']
  const faceValue = [0, 1, 0, 1, 0, 1]
  function assertCursorOnFace (data, dir) {
    const scale = (Math.abs(data.cursorX) > 1.001 || Math.abs(data.cursorY) > 1.001 || Math.abs(data.cursorZ) > 1.001) ? 16 : 1
    const cursor = { x: data.cursorX / scale, y: data.cursorY / scale, z: data.cursorZ / scale }
    const axis = faceAxis[dir]
    assert.ok(Math.abs(cursor[axis] - faceValue[dir]) < 0.05,
      `Cursor ${axis}=${cursor[axis]} not on the expected face (${faceValue[dir]}) for direction ${dir}`)
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

    const placePromise = captureNextBlockPlace()
    await bot.activateBlock(block)
    const data = await placePromise

    bot.test.sayEverywhere(`activateBlock face ${label}: expected=${expectedDir} actual=${data.direction}`)
    assert.strictEqual(data.direction, expectedDir, `Face direction mismatch for ${label}: expected ${expectedDir}, got ${data.direction}`)
    assertCursorOnFace(data, expectedDir)
  }

  // Regression for #3851: a 2-block-tall door must actually open with the default
  // (no direction). The old UP default clicked the lower half's top face, which the
  // server rejects because the upper half occupies y+1 — the door silently stayed shut.
  const doorName = ['bamboo_door', 'oak_door'].find(n => bot.registry.blocksByName[n])
  if (doorName) {
    const lower = new Vec3(9, groundY + 1, 9)
    const upper = lower.offset(0, 1, 0)
    const ls = lower.toArray().join(' ')
    const us = upper.toArray().join(' ')
    // facing=west => the door front faces the bot, which stands to its west (lower x)
    bot.chat(`/setblock ${ls} air`)
    bot.chat(`/setblock ${us} air`)
    await bot.test.wait(300)
    bot.chat(`/setblock ${ls} minecraft:${doorName}[half=lower,facing=west,hinge=left,open=false,powered=false]`)
    bot.chat(`/setblock ${us} minecraft:${doorName}[half=upper,facing=west,hinge=left,powered=false]`)
    await bot.test.wait(600)

    await bot.test.teleport(lower.offset(-2, 0, 0))
    await bot.test.wait(500)

    const isOpen = () => {
      const p = bot.blockAt(lower).getProperties()
      return p.open === true || p.open === 'true'
    }
    assert.strictEqual(isOpen(), false, `${doorName} should start closed`)

    await bot.activateBlock(bot.blockAt(lower)) // no direction -> auto-detect
    await bot.test.wait(800)

    bot.test.sayEverywhere(`activateBlock ${doorName}: open after default activate = ${isOpen()}`)
    assert.strictEqual(isOpen(), true, `${doorName} did not open with the auto-detected face (regression of #3851)`)
  }

  bot.test.sayEverywhere('activateBlock face direction test: pass')
}
