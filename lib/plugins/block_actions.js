const { Vec3 } = require('vec3')

const { CARDINAL_OFFSETS, CHEST_FACING_MAP, getChestType, parseChestMetadata } = require('../blocks.js')

module.exports = inject

function inject (bot) {
  const { instruments, blocks } = bot.registry

  // Stores how many players have currently open a container at a certain position
  const openCountByPos = {}

  bot._client.on('block_action', (packet) => {
    const pt = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    const block = bot.blockAt(pt)

    // Ignore on non-vanilla blocks
    if (block === null || !blocks[packet.blockId]) { return }

    const blockName = blocks[packet.blockId].name

    if (blockName === 'noteblock') { // Pre 1.13
      bot.emit('noteHeard', block, instruments[packet.byte1], packet.byte2)
    } else if (blockName === 'note_block') { // 1.13 onward
      bot.emit('noteHeard', block, instruments[Math.floor(block.metadata / 50)], Math.floor((block.metadata % 50) / 2))
    } else if (blockName === 'sticky_piston' || blockName === 'piston') {
      bot.emit('pistonMove', block, packet.byte1, packet.byte2)
    } else {
      let block2 = null

      if (blockName === 'chest' || blockName === 'trapped_chest') {
        const chestType = getChestType(bot, block)
        if (chestType === 'right') {
          const index = Object.values(CHEST_FACING_MAP[parseChestMetadata(bot, block).facing]).indexOf('left')
          const cardinalBlock2 = Object.keys(CHEST_FACING_MAP[parseChestMetadata(bot, block).facing])[index]
          const block2Position = block.position.plus(CARDINAL_OFFSETS[cardinalBlock2])
          block2 = bot.blockAt(block2Position)
        } else if (chestType === 'left') return // Omit left part of the chest so 'chestLidMove' doesn't emit twice when it's a double chest
      }

      // Emit 'chestLidMove' only if the number of players with the lid open changes
      if (openCountByPos[block.position] !== packet.byte2) {
        bot.emit('chestLidMove', block, packet.byte2, block2)

        if (packet.byte2 > 0) {
          openCountByPos[block.position] = packet.byte2
        } else {
          delete openCountByPos[block.position]
        }
      }
    }
  })

  bot._client.on('block_break_animation', (packet) => {
    const destroyStage = packet.destroyStage
    const pt = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    const block = bot.blockAt(pt)
    const entity = bot.entities[packet.entityId]

    if (destroyStage < 0 || destroyStage > 9) {
      // http://wiki.vg/Protocol#Block_Break_Progress
      // "0-9 to set it, any other value to remove it"
      bot.emit('blockBreakProgressEnd', block, entity)
    } else {
      bot.emit('blockBreakProgressObserved', block, destroyStage, entity)
    }
  })
}
