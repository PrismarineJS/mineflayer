const Vec3 = require('vec3').Vec3

const { spawn } = require('child_process')
const process = require('process')
const assert = require('assert')

module.exports = inject

function inject (bot) {
  const mcData = require('minecraft-data')(bot.version)
  const Block = require('prismarine-block')(bot.version)
  console.log(bot.version)
  const Item = require('prismarine-item')(bot.version)

  bot.test = {}
  bot.test.callbackChain = callbackChain
  bot.test.sayEverywhere = sayEverywhere
  bot.test.clearInventory = clearInventory
  bot.test.becomeSurvival = becomeSurvival
  bot.test.fly = fly
  bot.test.resetState = resetState
  bot.test.setInventorySlot = setInventorySlot
  bot.test.placeBlock = placeBlock
  bot.test.runExample = runExample
  bot.test.tellAndListen = tellAndListen

  function callbackChain (functions, cb) {
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

  // eslint-disable-next-line no-unused-vars
  function resetBlocksToSuperflat (cb) {
    // console.log('reset blocks to superflat')
    const groundY = 4
    for (let y = groundY + 4; y >= groundY - 1; y--) {
      const expectedBlock = superflatLayers[y] === undefined ? null : superflatLayers[y].block
      for (let i = 0; i < deltas3x3.length; i++) {
        const position = bot.entity.position.plus(deltas3x3[i])
        position.y = y
        const block = bot.blockAt(position)
        if (expectedBlock === null) {
          if (block.name === 'air') continue
          // dig it
          return digAndResume(position)
        } else {
          if (expectedBlock.type === block.type) continue
          // fix it
          if (block.type !== 0) {
            // dig it
            return digAndResume(position)
          }
          console.log('going to place layer ', y, 'with item ', superflatLayers[y].item.type, position)
          // place it
          return placeAndResume(position, superflatLayers[y].item)
        }
      }
    }
    // all good
    cb()

    function digAndResume (position) {
      bot.dig(bot.blockAt(position), resume)
    }

    function placeAndResume (position, item) {
      // console.log('place and resume with', item)
      setInventorySlot(36, new Item(item.type, 1, 0), () => {
        placeBlock(36, position, resume)
      })
    }

    function resume () {
      resetBlocksToSuperflat(cb)
    }
  }

  function placeBlock (slot, position, cb) {
    bot.setQuickBarSlot(slot - 36)
    // always place the block on the top of the block below it, i guess.
    const referenceBlock = bot.blockAt(position.plus(new Vec3(0, -1, 0)))
    bot.placeBlock(referenceBlock, new Vec3(0, 1, 0), cb)
  }

  // always leaves you in creative mode
  function resetState (cb) {
    callbackChain([
      becomeCreative,
      clearInventory,
      (cb) => {
        // console.log('start flying')
        bot.creative.startFlying()
        teleport(new Vec3(0, 4, 0), cb)
      },
      waitForChunksToLoad,
      resetBlocksToSuperflat,
      (cb) => { setTimeout(cb, 1000) },
      clearInventory
    ], cb)
  }

  function becomeCreative (cb) {
    // console.log('become creative')
    setCreativeMode(true, cb)
  }

  function becomeSurvival (cb) {
    setCreativeMode(false, cb)
  }

  function setCreativeMode (value, cb) {
    // this function behaves the same whether we start in creative mode or not.
    // also, creative mode is always allowed for ops, even if server.properties says force-gamemode=true in survival mode.

    function onMessage (jsonMsg) {
      // console.log(jsonMsg)
      switch (jsonMsg.translate) {
        case 'commands.gamemode.success.self':
        case 'gameMode.changed':
          // good.
          bot.removeListener('message', onMessage)
          clearTimeout(timeOut)
          return cb()
        case 'commands.generic.permission':
          sayEverywhere('ERROR: I need to be an op (allow cheats).')
          bot.removeListener('message', onMessage)
        // at this point we just wait forever.
        // the intention is that someone ops us while we're sitting here, then you kill and restart the test.
      }
      // console.log("I didn't expect this message:", jsonMsg);
    }
    bot.on('message', onMessage)
    bot.chat(`/gamemode ${value ? 'creative' : 'survival'}`)
    const timeOut = setTimeout(() => {
      bot.removeListener('message', onMessage)
      cb()
    }, 10000)
  }

  function clearInventory (cb) {
    for (let i = 0; i < bot.inventory.slots.length; i++) {
      if (bot.inventory.slots[i] == null) continue
      setInventorySlot(i, null, () => {
        // start over until we have nothing to do
        clearInventory(cb)
      })
      return
    }
    // done
    cb()
  }

  // you need to be in creative mode for this to work
  function setInventorySlot (targetSlot, item, cb) {
    assert(item === null || item.name !== 'unknown', `item should not be unknown ${JSON.stringify(item)}`)
    // TODO FIX
    if (Item.equal(bot.inventory.slots[targetSlot], item)) {
      // console.log('placing')
      // console.log(bot.inventory.slots[targetSlot])
      // already good to go
      return setImmediate(cb)
    }

    bot.creative.setInventorySlot(targetSlot, item, cb)
  }

  function teleport (position, cb) {
    bot.chat(`/tp ${bot.username} ${position.x} ${position.y} ${position.z}`)
    bot.on('move', function onMove () {
      if (bot.entity.position.distanceTo(position) < 0.9) {
        // close enough
        bot.removeListener('move', onMove)
        cb()
      }
    })
  }

  function sayEverywhere (message) {
    bot.chat(message)
    console.log(message)
  }

  var deltas3x3 = [
    new Vec3(-1, 0, -1),
    new Vec3(0, 0, -1),
    new Vec3(1, 0, -1),
    new Vec3(-1, 0, 0),
    new Vec3(0, 0, 0),
    new Vec3(1, 0, 0),
    new Vec3(-1, 0, 1),
    new Vec3(0, 0, 1),
    new Vec3(1, 0, 1)
  ]

  function waitForChunksToLoad (cb) {
    // check 3x3 chunks around us
    for (let i = 0; i < deltas3x3.length; i++) {
      if (bot.blockAt(bot.entity.position.plus(deltas3x3[i].scaled(32))) == null) {
        // console.log(deltas3x3[i] + 'absent')
        // keep wait
        return setTimeout(() => {
          waitForChunksToLoad(cb)
        }, 100)
      }
    }
    cb()
  }

  function fly (delta, cb) {
    bot.creative.flyTo(bot.entity.position.plus(delta), cb)
  }

  function tellAndListen (to, what, listen, done) {
    function chatHandler (username, message) {
      if (username === to && listen(message)) {
        bot.removeListener('chat', chatHandler)
        done()
      }
    }
    bot.on('chat', chatHandler)
    bot.chat(what)
  }

  function runExample (file, run, cb) {
    function joinHandler (message) {
      if (message.json.translate === 'multiplayer.player.joined') {
        bot.removeListener('message', joinHandler)
        const childBotName = message.json.with[0].insertion
        run(childBotName, closeExample)
      }
    }
    bot.on('message', joinHandler)

    const child = spawn('node', [file, 'localhost', `${bot.test.port}`])

    // Useful to debug child processes:
    child.stdout.on('data', (data) => { console.log(`${data}`) })
    child.stderr.on('data', (data) => { console.error(`${data}`) })

    const timeout = setTimeout(() => {
      console.log('Timeout, test took too long')
      closeExample(new Error('Timeout, test took too long'))
    }, 10000)

    function closeExample (err) {
      if (timeout) clearTimeout(timeout)
      console.log('kill process ' + child.pid)

      child.once('close', (code) => {
        console.log('close requested ' + code)
        cb(err)
      })
      process.kill(child.pid, 'SIGTERM')
    }
  }
}
