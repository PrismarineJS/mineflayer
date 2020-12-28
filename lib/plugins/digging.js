const nbt = require('prismarine-nbt')
const { performance } = require('perf_hooks')
const { createDoneTask, createTask } = require('../promise_utils')

module.exports = inject

function inject (bot) {
  let swingInterval = null
  let waitTimeout = null

  let diggingTask = createDoneTask()

  bot.targetDigBlock = null
  bot.lastDigTime = null

  async function dig (block, forceLook) {
    if (block === null || block === undefined) {
      throw new Error('dig was called with an undefined or null block')
    }

    if (bot.targetDigBlock) bot.stopDigging()

    if (forceLook !== 'ignore') {
      await bot.lookAt(block.position.offset(0.5, 0.5, 0.5), forceLook)
    }

    diggingTask = createTask()
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

    function finishDigging () {
      clearInterval(swingInterval)
      clearTimeout(waitTimeout)
      swingInterval = null
      waitTimeout = null
      if (bot.targetDigBlock !== null && bot.targetDigBlock !== undefined) {
        bot._client.write('block_dig', {
          status: 2, // finish digging
          location: bot.targetDigBlock.position,
          face: 1 // hard coded to always dig from the top
        })
      }
      bot.targetDigBlock = null
      bot.lastDigTime = performance.now()
      bot._updateBlockState(block.position, 0)
    }

    const eventName = `blockUpdate:${block.position}`
    bot.on(eventName, onBlockUpdate)

    await diggingTask.promise

    bot.stopDigging = () => {
      if (bot.targetDigBlock === null || bot.targetDigBlock === undefined) return
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
      diggingTask.cancel(new Error('Digging aborted'))
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
      diggingTask.finish()
    }
  }

  function canDigBlock (block) {
    return block && block.diggable && block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position.offset(0, 1.65, 0)) <= 5.1
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

  bot.dig = callbackify(dig)
  bot.stopDigging = noop
  bot.canDigBlock = canDigBlock
  bot.digTime = digTime
}

function callbackify (f) { // specifically for this function because cb could be the non-last parameter
  return function (...args) {
    const cbIndex = typeof args[1] === 'function' ? 1 : 2
    const cb = args[cbIndex]

    if (cbIndex === 1) args[1] = true
    else if (typeof args[1] === 'string') args[1] = args[1] === 'ignore' ? args[1] : false
    else args[1] = !!args[1] // coerce to boolean

    return f(...args).then(r => { if (cb) { cb(undefined, r) } return r }, err => { if (cb) { cb(err) } else throw err })
  }
}

function noop (err) {
  if (err) throw err
}
