const { Vec3 } = require('vec3')

const { spawn } = require('child_process')
const { once } = require('../../../lib/promise_utils')
const process = require('process')
const assert = require('assert')
const { sleep, onceWithCleanup, withTimeout } = require('../../../lib/promise_utils')

const timeout = 5000
module.exports = inject

function inject (bot) {
  console.log(bot.version)

  bot.test = {}
  bot.test.groundY = bot.supportFeature('tallWorld') ? -60 : 4
  bot.test.sayEverywhere = sayEverywhere
  bot.test.clearInventory = clearInventory
  bot.test.becomeSurvival = becomeSurvival
  bot.test.becomeCreative = becomeCreative
  bot.test.fly = fly
  bot.test.teleport = teleport
  bot.test.resetState = resetState
  bot.test.setInventorySlot = setInventorySlot
  bot.test.placeBlock = placeBlock
  bot.test.runExample = runExample
  bot.test.tellAndListen = tellAndListen
  bot.test.selfKill = selfKill
  bot.test.wait = function (ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms) })
  }

  bot.test.awaitItemReceived = async (command) => {
    const p = once(bot.inventory, 'updateSlot')
    bot.chat(command)
    await p // await getting the item
  }
  // setting relative to true makes x, y, & z relative using ~
  bot.test.setBlock = async ({ x = 0, y = 0, z = 0, relative, blockName }) => {
    const { x: _x, y: _y, z: _z } = relative ? bot.entity.position.floored().offset(x, y, z) : { x, y, z }
    const block = bot.blockAt(new Vec3(_x, _y, _z))
    if (block.name === blockName) {
      return
    }
    const p = once(bot.world, `blockUpdate:(${_x}, ${_y}, ${_z})`)
    const prefix = relative ? '~' : ''
    bot.chat(`/setblock ${prefix}${x} ${prefix}${y} ${prefix}${z} ${blockName}`)
    await p
  }

  let grassName
  if (bot.supportFeature('itemsAreNotBlocks')) {
    grassName = 'grass_block'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    grassName = 'grass'
  }

  const layerNames = [
    'bedrock',
    'dirt',
    'dirt',
    grassName,
    'air',
    'air',
    'air',
    'air',
    'air'
  ]

  async function resetBlocksToSuperflat () {
    const groundY = 4
    for (let y = groundY + 4; y >= groundY - 1; y--) {
      const realY = y + bot.test.groundY - 4
      bot.chat(`/fill ~-5 ${realY} ~-5 ~5 ${realY} ~5 ` + layerNames[y])
    }
    await bot.test.wait(100)
  }

  async function placeBlock (slot, position) {
    bot.setQuickBarSlot(slot - 36)
    // always place the block on the top of the block below it, i guess.
    const referenceBlock = bot.blockAt(position.plus(new Vec3(0, -1, 0)))
    return bot.placeBlock(referenceBlock, new Vec3(0, 1, 0))
  }

  // always leaves you in creative mode
  async function resetState () {
    await becomeCreative()
    await clearInventory()
    bot.creative.startFlying()
    await teleport(new Vec3(0, bot.test.groundY, 0))
    await bot.waitForChunksToLoad()
    await resetBlocksToSuperflat()
    await sleep(1000)
    await clearInventory()
  }

  async function becomeCreative () {
    // console.log('become creative')
    return setCreativeMode(true)
  }

  async function becomeSurvival () {
    return setCreativeMode(false)
  }

  const gameModeChangedMessages = ['commands.gamemode.success.self', 'gameMode.changed']

  async function setCreativeMode (value) {
    const getGM = val => val ? 'creative' : 'survival'
    // this function behaves the same whether we start in creative mode or not.
    // also, creative mode is always allowed for ops, even if server.properties says force-gamemode=true in survival mode.
    let i = 0
    const msgProm = onceWithCleanup(bot, 'message', {
      timeout,
      checkCondition: msg => gameModeChangedMessages.includes(msg.translate) && i++ > 0 && bot.game.gameMode === getGM(value)
    })

    // do it three times to ensure that we get feedback
    bot.chat(`/gamemode ${getGM(value)}`)
    bot.chat(`/gamemode ${getGM(!value)}`)
    bot.chat(`/gamemode ${getGM(value)}`)
    return msgProm
  }

  async function clearInventory () {
    // In creative mode, use bot.creative.clearInventory() to avoid slot conflicts
    if (bot.game.gameMode === 'creative') {
      await bot.creative.clearInventory()
      await sleep(200) // Let updates propagate

      // Verify it's cleared
      const hasItems = bot.inventory.slots.some(slot => slot && slot.itemCount > 0)
      if (hasItems) {
        const items = bot.inventory.slots.filter(s => s).map((s, i) => `slot ${i}: ${s.name} x${s.itemCount}`)
        throw new Error('Creative inventory was not cleared: ' + items.join(', '))
      }
      return
    }

    // In survival mode, use /clear command
    // Run /clear multiple times to ensure everything is cleared
    for (let attempt = 0; attempt < 5; attempt++) {
      const clearInv = onceWithCleanup(bot, 'message', {
        timeout,
        checkCondition: msg => {
          const translate = msg.translate || ''
          return translate.includes('clear') && translate.includes('success')
        }
      })
      bot.chat('/clear')

      try {
        await clearInv
      } catch (err) {
        // If clear times out, check if inventory is already empty
        const hasItems = bot.inventory.slots.some(slot => slot && slot.itemCount > 0)
        if (!hasItems) {
          break // Inventory is clear, we're done
        }
        if (attempt === 4) {
          throw err // Re-throw on final attempt
        }
      }

      // Check if inventory is now clear
      await sleep(200) // Longer delay to let updates propagate
      const hasItems = bot.inventory.slots.some(slot => slot && slot.itemCount > 0)
      if (!hasItems) {
        break // Successfully cleared
      }
    }

    // Additional wait and final clear to catch any stragglers
    await sleep(300)
    bot.chat('/clear')
    await sleep(200)

    // Final verification
    const hasItems = bot.inventory.slots.some(slot => slot && slot.itemCount > 0)
    if (hasItems) {
      const items = bot.inventory.slots.filter(s => s).map((s, i) => `slot ${i}: ${s.name} x${s.itemCount}`)
      throw new Error('Inventory was not cleared after 5 attempts: ' + items.join(', '))
    }
  }

  // you need to be in creative mode for this to work
  async function setInventorySlot (targetSlot, item) {
    assert(item === null || item.name !== 'unknown', `item should not be unknown ${JSON.stringify(item)}`)
    return bot.creative.setInventorySlot(targetSlot, item)
  }

  async function teleport (position) {
    if (bot.supportFeature('hasExecuteCommand')) {
      bot.test.sayEverywhere(`/execute in overworld run teleport ${bot.username} ${position.x} ${position.y} ${position.z}`)
    } else {
      bot.test.sayEverywhere(`/tp ${bot.username} ${position.x} ${position.y} ${position.z}`)
    }
    return onceWithCleanup(bot, 'move', {
      timeout,
      checkCondition: () => bot.entity.position.distanceTo(position) < 0.9
    })
  }

  function sayEverywhere (message) {
    bot.chat(message)
    console.log(message)
  }

  async function fly (delta) {
    return bot.creative.flyTo(bot.entity.position.plus(delta))
  }

  async function tellAndListen (to, what, listen) {
    const chatMessagePromise = onceWithCleanup(bot, 'chat', {
      timeout,
      checkCondition: (username, message) => username === to && listen(message)
    })

    bot.chat(what)

    return chatMessagePromise
  }

  async function runExample (file, run) {
    let childBotName

    const detectChildJoin = async () => {
      const [message] = await onceWithCleanup(bot, 'message', {
        timeout: 15000, // Increased timeout for child process to connect
        checkCondition: message => message.json.translate === 'multiplayer.player.joined'
      })
      childBotName = message.json.with[0].insertion
      bot.chat(`/tp ${childBotName} 50 ${bot.test.groundY} 0`)
      setTimeout(() => {
        bot.chat('loaded')
      }, 5000)
    }

    const runExampleOnReady = async () => {
      await onceWithCleanup(bot, 'chat', {
        checkCondition: (username, message) => message === 'Ready!'
      })
      return run(childBotName)
    }

    // Pass version to child process so it can connect with correct protocol
    const child = spawn('node', [file, '127.0.0.1', `${bot.test.port}`, '', '', bot.version])

    // Useful to debug child processes:
    child.stdout.on('data', (data) => { console.log(`${data}`) })
    child.stderr.on('data', (data) => { console.error(`${data}`) })

    const closeExample = async (err) => {
      console.log('kill process ' + child.pid)

      try {
        process.kill(child.pid, 'SIGTERM')
        const [code] = await onceWithCleanup(child, 'close', { timeout: 1000 })
        console.log('close requested', code)
      } catch (e) {
        console.log(e)
        console.log('process termination failed, process may already be closed')
      }

      if (err) {
        throw err
      }
    }

    try {
      await withTimeout(Promise.all([detectChildJoin(), runExampleOnReady()]), 30000)
    } catch (err) {
      console.log(err)
      return closeExample(err)
    }
    return closeExample()
  }

  function selfKill () {
    bot.chat('/kill @p')
  }

  // Debug packet IO when tests are re-run with "Enable debug logging" - https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
  if (process.env.RUNNER_DEBUG) {
    bot._client.on('packet', function (data, meta) {
      if (['chunk', 'time', 'light', 'alive'].some(e => meta.name.includes(e))) return
      console.log('->', meta.name, JSON.stringify(data)?.slice(0, 250))
    })
    const oldWrite = bot._client.write
    bot._client.write = function (name, data) {
      if (['alive', 'pong', 'ping'].some(e => name.includes(e))) return
      console.log('<-', name, JSON.stringify(data)?.slice(0, 250))
      oldWrite.apply(bot._client, arguments)
    }
      BigInt.prototype.toJSON ??= function () { // eslint-disable-line
      return this.toString()
    }
  }
}
