const nbt = require('prismarine-nbt')
const { performance } = require('perf_hooks')
const { createDoneTask, createTask } = require('../promise_utils')
const BlockFaces = require('prismarine-world').iterators.BlockFace
const { Vec3 } = require('vec3')

module.exports = inject

function inject (bot) {
  let swingInterval = null
  let waitTimeout = null

  let diggingTask = createDoneTask()

  bot.targetDigBlock = null
  bot.lastDigTime = null

  async function dig (block, forceLook, digFace) {
    if (block === null || block === undefined) {
      throw new Error('dig was called with an undefined or null block')
    }
    if (!digFace || typeof digFace === 'function') {
      digFace = 'auto'
    }

    if (bot.targetDigBlock) bot.stopDigging()

    let diggingFace = 1 // Default (top)

    if (forceLook !== 'ignore') {
      if (digFace?.x || digFace?.y || digFace?.z) {
        // Determine the block face the bot should mine
        if (digFace.x) {
          diggingFace = digFace.x > 0 ? BlockFaces.EAST : BlockFaces.WEST
        } else if (digFace.y) {
          diggingFace = digFace.y > 0 ? BlockFaces.TOP : BlockFaces.BOTTOM
        } else if (digFace.z) {
          diggingFace = digFace.z > 0 ? BlockFaces.SOUTH : BlockFaces.NORTH
        }
        await bot.lookAt(block.position.offset(0.5, 0.5, 0.5).offset(digFace.x * 0.5, digFace.y * 0.5, digFace.z * 0.5), forceLook)
      } else if (digFace === 'raycast') {
        // Check faces that could be seen from the current position. If the delta is smaller then 0.5 that means the
        // bot cam most likely not see the face as the block is 1 block thick
        // this could be false for blocks that have a smaller bounding box then 1x1x1
        const dx = bot.entity.position.x - block.position.x + 0.5
        const dy = bot.entity.position.y - block.position.y - 0.5 + bot.entity.height // -0.5 because the bot position
        // is calculated from the block position that is inside its feet so 0.5 - 1 = -0.5
        const dz = bot.entity.position.z - block.position.z + 0.5
        // Check y first then x and z
        const visibleFaces = {
          y: Math.sign(Math.abs(dy) > 0.5 ? dy : 0),
          x: Math.sign(Math.abs(dx) > 0.5 ? dx : 0),
          z: Math.sign(Math.abs(dz) > 0.5 ? dz : 0)
        }
        const validFaces = []
        for (const i in visibleFaces) {
          if (!visibleFaces[i]) continue // skip as this face is not visible
          // target position on the target block face. -> 0.5 + (current face) * 0.5
          const targetPos = block.position.offset(0.5 + (i === 'x' ? visibleFaces[i] * 0.5 : 0), 0.5 + (i === 'y' ? visibleFaces[i] * 0.5 : 0), 0.5 + (i === 'z' ? visibleFaces[i] * 0.5 : 0))
          const startPos = bot.entity.position.offset(0, bot.entity.height, 0)
          const rayBlock = bot.world.raycast(startPos, targetPos.clone().subtract(startPos).normalize(), 5)
          if (rayBlock) {
            const rayPos = rayBlock.position
            if (rayPos.x === block.position.x && rayPos.y === block.position.y && rayPos.z === block.position.z) {
              // console.info(rayBlock)
              validFaces.push({
                face: rayBlock.face,
                targetPos: rayBlock.intersect
              })
            }
          }
        }
        if (validFaces.length > 0) {
          // Chose closest valid face
          let closest
          let distSqrt = 999
          for (const i in validFaces) {
            const tPos = validFaces[i].targetPos
            const cDist = new Vec3(tPos.x, tPos.y, tPos.z).distanceSquared(bot.entity.position.offset(0, bot.entity.height, 0))
            if (distSqrt > cDist) {
              closest = validFaces[i]
              distSqrt = cDist
            }
          }
          await bot.lookAt(closest.targetPos, forceLook)
          diggingFace = closest.face
        } else {
          // Block is obstructed return error?
          throw new Error('Block not in view')
        }
      } else {
        await bot.lookAt(block.position.offset(0.5, 0.5, 0.5), forceLook)
      }
    }

    diggingTask = createTask()
    bot._client.write('block_dig', {
      status: 0, // start digging
      location: block.position,
      face: diggingFace // default face is 1 (top)
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
      if (bot.targetDigBlock) {
        bot._client.write('block_dig', {
          status: 2, // finish digging
          location: bot.targetDigBlock.position,
          face: diggingFace // hard coded to always dig from the top
        })
      }
      bot.targetDigBlock = null
      bot.lastDigTime = performance.now()
      bot._updateBlockState(block.position, 0)
    }

    const eventName = `blockUpdate:${block.position}`
    bot.on(eventName, onBlockUpdate)

    bot.stopDigging = () => {
      if (!bot.targetDigBlock) return
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

    await diggingTask.promise
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
        enchantments = nbt.simplify(bot.heldItem.nbt).Enchantments || nbt.simplify(bot.heldItem.nbt).ench
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
    const cbIndex = typeof args[1] === 'function' ? 1 : (typeof args[2] === 'function' ? 2 : 3)
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
