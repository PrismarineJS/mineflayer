const Vec3 = require('vec3').Vec3

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

  const superflatLayers = [
    { block: new Block(mcData.blocksByName.bedrock.id), item: new Item(mcData.itemsByName.bedrock.id) },
    { block: new Block(mcData.blocksByName.dirt.id), item: new Item(mcData.itemsByName.dirt.id) },
    { block: new Block(mcData.blocksByName.dirt.id), item: new Item(mcData.itemsByName.dirt.id) },
    { block: new Block(mcData.blocksByName.grass.id), item: new Item(mcData.itemsByName.grass.id) }
    // and then air
  ]

  function resetBlocksToSuperflat (cb) {
    console.log('reset blocks to superflat')
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
          console.log(expectedBlock.type, '!==', block.type)
          console.log('going to place layer ', y, 'with item ', superflatLayers[y].item.type)
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
      console.log('place and resume with', item)
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
        console.log('start flying')
        bot.creative.startFlying()
        teleport(new Vec3(0, 4, 0), cb)
      },
      waitForChunksToLoad,
      // resetBlocksToSuperflat,
      clearInventory
    ], cb)
  }

  function becomeCreative (cb) {
    console.log('become creative')
    setCreativeMode(true, cb)
  }

  function becomeSurvival (cb) {
    setCreativeMode(false, cb)
  }

  function setCreativeMode (value, cb) {
    // this function behaves the same whether we start in creative mode or not.
    // also, creative mode is always allowed for ops, even if server.properties says force-gamemode=true in survival mode.
    let timeOut = null
    function onMessage (jsonMsg) {
      console.log(jsonMsg)
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
    timeOut = setTimeout(() => {
      bot.removeListener('message', onMessage)
      cb()
    }, 10000)
  }

  function clearInventory (cb) {
    console.log('clear inventory')
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
    // TODO FIX
    if (Item.equal(bot.inventory.slots[targetSlot], item)) {
      console.log('placing')
      console.log(bot.inventory.slots[targetSlot])
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
    console.log('wait for chunks around ' + bot.entity.position)
    // check 3x3 chunks around us
    for (let i = 0; i < deltas3x3.length; i++) {
      if (bot.blockAt(bot.entity.position.plus(deltas3x3[i].scaled(32))) == null) {
        console.log(deltas3x3[i] + 'absent')
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
}
