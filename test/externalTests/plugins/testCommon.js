const { Vec3 } = require('vec3')

const { spawn } = require('child_process')
const { once } = require('events')
const process = require('process')
const assert = require('assert')
const util = require('util')
const { callbackify, sleep, onceWithCleanup, withTimeout } = require('../../../lib/promise_utils')

module.exports = inject

function inject (bot) {
  console.log(bot.version)
  const Item = require('prismarine-item')(bot.version)

  bot.test = {}
  bot.test.groundY = bot.supportFeature('tallWorld') ? -60 : 4
  bot.test.sayEverywhere = sayEverywhere
  bot.test.clearInventory = callbackify(clearInventory)
  bot.test.becomeSurvival = callbackify(becomeSurvival)
  bot.test.becomeCreative = callbackify(becomeCreative)
  bot.test.fly = callbackify(fly)
  bot.test.resetState = callbackify(resetState)
  bot.test.setInventorySlot = callbackify(setInventorySlot)
  bot.test.placeBlock = callbackify(placeBlock)
  bot.test.runExample = callbackify(runExample)
  bot.test.tellAndListen = callbackify(tellAndListen)
  bot.test.wait = function (ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms) })
  }

  bot.test.awaitItemRecieved = callbackify(async (command) => {
    const p = once(bot.inventory, 'updateSlot')
    bot.chat(command)
    await p // await getting the item
  })
  // setting relative to true makes x, y, & z relative using ~
  bot.test.setBlock = callbackify(async ({ x = 0, y = 0, z = 0, relative, blockName }) => {
    const { x: _x, y: _y, z: _z } = relative ? bot.entity.position.floored().offset(x, y, z) : { x, y, z }
    const block = bot.blockAt(new Vec3(_x, _y, _z))
    if (block.name === blockName) {
      return
    }
    const p = once(bot.world, `blockUpdate:(${_x}, ${_y}, ${_z})`)
    const prefix = relative ? '~' : ''
    bot.chat(`/setblock ${prefix}${x} ${prefix}${y} ${prefix}${z} ${blockName}`)
    await p
  })

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

  async function setCreativeMode (value) {
    // this function behaves the same whether we start in creative mode or not.
    // also, creative mode is always allowed for ops, even if server.properties says force-gamemode=true in survival mode.

    const onMessage = (jsonMsg) => {
      // console.log(jsonMsg)
      switch (jsonMsg.translate) {
        case 'commands.gamemode.success.self':
        case 'gameMode.changed':
          return true
        case 'commands.generic.permission':
          sayEverywhere('ERROR: I need to be an op (allow cheats).')
        // at this point we just wait forever.
        // the intention is that someone ops us while we're sitting here, then you kill and restart the test.
      }
      // console.log("I didn't expect this message:", jsonMsg);
      return false
    }

    const waitForMessage = async () => {
      try {
        await onceWithCleanup(bot, 'message', {
          checkCondition: onMessage,
          timeout: 10000
        })
      } catch (_) {
        // For whatever reason, timeout = success, and there is no other failure condition in this promise,
        // so we can safely eat this exception.
      }
    }

    const messagePromise = waitForMessage()

    bot.chat(`/gamemode ${value ? 'creative' : 'survival'}`)

    return messagePromise
  }

  async function clearInventory () {
    bot.chat('/clear')
    // We don't care if its success of failure (it fails if the inventory was empty already)
    await once(bot, 'message')
  }

  // you need to be in creative mode for this to work
  async function setInventorySlot (targetSlot, item) {
    assert(item === null || item.name !== 'unknown', `item should not be unknown ${JSON.stringify(item)}`)
    // TODO FIX
    if (Item.equal(bot.inventory.slots[targetSlot], item)) {
      // console.log('placing')
      // console.log(bot.inventory.slots[targetSlot])
      // already good to go
      return
    }

    return bot.creative.setInventorySlot(targetSlot, item)
  }

  async function teleport (position) {
    bot.chat(`/tp ${bot.username} ${position.x} ${position.y} ${position.z}`)

    return onceWithCleanup(bot, 'move', {
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
      checkCondition: (username, message) => username === to && listen(message)
    })

    bot.chat(what)

    return chatMessagePromise
  }

  async function runExample (file, run) {
    // TODO: remove this once all examples have been converted to promises
    run = util.promisify(run)

    let childBotName

    const detectChildJoin = async () => {
      const [message] = await onceWithCleanup(bot, 'message', {
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

    const child = spawn('node', [file, 'localhost', `${bot.test.port}`])

    // Useful to debug child processes:
    child.stdout.on('data', (data) => { console.log(`${data}`) })
    child.stderr.on('data', (data) => { console.error(`${data}`) })

    const closeExample = async (err) => {
      console.log('kill process ' + child.pid)

      process.kill(child.pid, 'SIGTERM')

      const [code] = await once(child, 'close')
      console.log('close requested', code)

      if (err) {
        throw err
      }
    }

    try {
      await withTimeout(Promise.all([detectChildJoin(), runExampleOnReady()]), 20000)
    } catch (err) {
      console.log(err)
      return closeExample(err)
    }
    return closeExample()
  }
}
