const nbt = require('prismarine-nbt')
const { performance } = require('perf_hooks')

module.exports = inject

function inject (bot) {
  let swingInterval = null
  let waitTimeout = null

  bot.targetDigBlock = null
  bot.lastDigTime = null

  function dig (block, forceLook, cb) {
    if (bot.targetDigBlock) bot.stopDigging()
    if (typeof forceLook === 'function') {
      cb = forceLook
      forceLook = true
    }
    cb = cb || noop
    bot.lookAt(block.position.offset(0.5, 0.5, 0.5), forceLook, () => {
      bot._client.write('block_dig', {
        status: 0, // start digging
        location: block.position,
        face: 1 // hard coded to always dig from the top
      })
      const waitTime = bot.digTime(block)
      waitTimeout = setTimeout(finishDigging, waitTime)
      bot.targetDigBlock = block
      bot.swingArm()

      swingInterval = setInterval(() => {
        bot.swingArm()
      }, 350)

      const eventName = `blockUpdate:${block.position}`
      bot.on(eventName, onBlockUpdate)

      bot.stopDigging = () => {
        if (bot.targetDigBlock === null) return
        bot.removeListener(eventName, onBlockUpdate)
        clearInterval(swingInterval)
        clearTimeout(waitTimeout)
        swingInterval = null
        waitTimeout = null
        bot._client.write('block_dig', {
          status: 1, // cancel digging
          location: bot.targetDigBlock.position,
          face: 1 // hard coded to always dig from the top
        })
        const block = bot.targetDigBlock
        bot.targetDigBlock = null
        bot.lastDigTime = performance.now()
        bot.emit('diggingAborted', block)
        bot.stopDigging = noop
        cb(new Error('Digging aborted'))
      }

      function onBlockUpdate (oldBlock, newBlock) {
        // vanilla server never actually interrupt digging, but some server send block update when you start digging
        // so ignore block update if not air
        if (newBlock.type !== 0) return
        bot.removeListener(eventName, onBlockUpdate)
        clearInterval(swingInterval)
        clearTimeout(waitTimeout)
        swingInterval = null
        waitTimeout = null
        bot.targetDigBlock = null
        bot.lastDigTime = performance.now()
        bot.emit('diggingCompleted', newBlock)
        cb()
      }

      function finishDigging () {
        clearInterval(swingInterval)
        clearTimeout(waitTimeout)
        swingInterval = null
        waitTimeout = null
        bot._client.write('block_dig', {
          status: 2, // finish digging
          location: bot.targetDigBlock.position,
          face: 1 // hard coded to always dig from the top
        })
        bot.targetDigBlock = null
        bot.lastDigTime = performance.now()
        bot._updateBlockState(block.position, 0)
      }
    })
  }

  function canDigBlock (block) {
    return block && block.diggable && block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6
  }

  function digTime (block) {
    let type = null
    let enchantments = []
    if (bot.heldItem) {
      type = bot.heldItem.type
      if (bot.heldItem.nbt) {
        enchantments = nbt.simplify(bot.heldItem.nbt).Enchantments
      }
    }
    const creative = bot.game.gameMode === 'creative'
    return block.digTime(type, creative, bot.entity.isInWater, !bot.entity.onGround, enchantments, bot.entity.effects)
  }

  bot.dig = dig
  bot.stopDigging = noop
  bot.canDigBlock = canDigBlock
  bot.digTime = digTime
}

function noop (err) {
  if (err) throw err
}
