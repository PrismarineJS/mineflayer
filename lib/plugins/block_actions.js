const Vec3 = require('vec3').Vec3

module.exports = inject

function inject (bot, { version }) {
  const { instruments, blocks } = require('minecraft-data')(version)
  bot._client.on('block_action', (packet) => {
    // block action
    const pt = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    const block = bot.blockAt(pt)
    const blockName = blocks[packet.blockId].name
    if (blockName === 'noteblock' || blockName === 'note_block') {
      bot.emit('noteHeard', block, instruments[packet.byte1], packet.byte2)
    } else if (blockName === 'sticky_piston' || blockName === 'piston') {
      bot.emit('pistonMove', block, packet.byte1, packet.byte2)
    } else {
      bot.emit('chestLidMove', block, packet.byte2)
    }
  })

  bot._client.on('block_break_animation', (packet) => {
    const destroyStage = packet.destroyStage
    const pt = new Vec3(packet.location.x, packet.location.y, packet.location.z)
    const block = bot.blockAt(pt)

    if (destroyStage < 0 || destroyStage > 9) {
      // http://wiki.vg/Protocol#Block_Break_Progress
      // "0-9 to set it, any other value to remove it"
      bot.emit('blockBreakProgressEnd', block)
    } else {
      bot.emit('blockBreakProgressObserved', block, destroyStage)
    }
  })
}
