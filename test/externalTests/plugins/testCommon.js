const Vec3 = require('vec3').Vec3

const { spawn } = require('child_process')
const { once } = require('events')
const process = require('process')
const assert = require('assert')
const util = require('util')
const { callbackify, sleep, onceWithCleanup, withTimeout } = require('../../../lib/promise_utils')

module.exports = inject

function inject (bot) {
  const mcData = require('minecraft-data')(bot.version)
  const Block = require('prismarine-block')(bot.version)
  console.log(bot.version)
  const Item = require('prismarine-item')(bot.version)

  bot.test = {}
  bot.test.callbackChain = callbackChain
  bot.test.sayEverywhere = sayEverywhere
  bot.test.clearInventory = callbackify(clearInventory)
  bot.test.becomeSurvival = callbackify(becomeSurvival)
  bot.test.fly = callbackify(fly)
  bot.test.resetState = callbackify(resetState)
  bot.test.setInventorySlot = callbackify(setInventorySlot)
  bot.test.placeBlock = callbackify(placeBlock)
  bot.test.runExample = callbackify(runExample)
  bot.test.tellAndListen = callbackify(tellAndListen)

  function callbackChain (functions, cb) {
    assert(cb, new Error('You must provide a callback to bot.test.callbackChain'))
    let i = 0
    callNext()

    function callNext () {
      if (i < functions.length) {
        functions[i++](callNext)
      } else {
        cb()
      }
    }
  }

  let grassName
  let itemsByName

  if (bot.supportFeature('itemsAreNotBlocks')) {
    grassName = 'grass_block'
    itemsByName = 'itemsByName'
  } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
    grassName = 'grass'
    itemsByName = 'blocksByName'
  }

  const superflatLayers = [
    { block: new Block(mcData.blocksByName.bedrock.id), item: new Item(mcData[itemsByName].bedrock.id) },
    { block: new Block(mcData.blocksByName.dirt.id), item: new Item(mcData[itemsByName].dirt.id) },
    { block: new Block(mcData.blocksByName.dirt.id), item: new Item(mcData[itemsByName].dirt.id) },
    { block: new Block(mcData.blocksByName[grassName].id), item: new Item(mcData[itemsByName][grassName].id) }
    // and then air
  ]

  const deltas = []
  const deltaSize = 5
  for (let i = -Math.floor(deltaSize / 2); i <= Math.floor(deltaSize / 2); i++) {
    for (let j = -Math.floor(deltaSize / 2); j <= Math.floor(deltaSize / 2); j++) {
      deltas.push(new Vec3(i, 0, j))
    }
  }

  async function resetBlocksToSuperflat () {
    // console.log('reset blocks to superflat')
    const groundY = 4
    for (let y = groundY + 4; y >= groundY - 1; y--) {
      const expectedBlock = superflatLayers[y] === undefined ? null : superflatLayers[y].block
      for (let i = 0; i < deltas.length; i++) {
        const position = bot.entity.position.plus(deltas[i])
        position.y = y
        const block = bot.blockAt(position)
        if (expectedBlock === null) {
          if (block.name === 'air') continue
          // dig it
          await dig(position)
        } else {
          if (expectedBlock.type === block.type) continue
          // fix it
          if (block.type !== 0) {
            // dig it
            await dig(position)
          }
          console.log('going to place layer ', y, 'with item ', superflatLayers[y].item.type, position)
          // place it
          await place(position, superflatLayers[y].item)
        }
      }
    }

    function dig (position) {
      return bot.dig(bot.blockAt(position))
    }

    async function place (position, item) {
      // console.log('place and resume with', item)
      await setInventorySlot(36, new Item(item.type, 1, 0))
      await placeBlock(36, position)
    }
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
    await teleport(new Vec3(0, 4, 0))
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

    const listenerPromise = onceWithCleanup(bot, 'message', { checkCondition: onMessage, timeout: 10000 })

    bot.chat(`/gamemode ${value ? 'creative' : 'survival'}`)

    return listenerPromise
  }

  async function clearInventory () {
    for (let i = 0; i < bot.inventory.slots.length; i++) {
      if (bot.inventory.slots[i] == null) continue
      await setInventorySlot(i, null)
    }
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
    return new Promise(resolve => {
      const onChatMessage = (username, message) => {
        if (username === to && listen(message)) {
          bot.removeListener('chat', onChatMessage)
          resolve()
        }
      }
      bot.on('chat', onChatMessage)
      bot.chat(what)
    })
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
      bot.chat(`/tp ${childBotName} 50 4 0`)
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
