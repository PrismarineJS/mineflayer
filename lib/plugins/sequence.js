module.exports = inject

// One block prediction sequence shared by dig start/stop, use_item_on and use_item. Sent values
// start at 1; abort, release and drop actions send 0 and must not consume a value. Versions
// before 1.19 have no sequence field, so the value is simply not serialized there.
function inject (bot) {
  let sequence = 0
  let world = null

  bot._nextSequence = () => ++sequence

  // The vanilla client keeps the counter in its level, and it builds a new level on login and on a
  // respawn into another world: the counter starts again there. A respawn in the same world (after
  // a death) keeps the level and the counter.
  const worldOf = (packet) => packet.worldState?.name ?? packet.worldName
  bot._client.on('login', (packet) => {
    sequence = 0
    world = worldOf(packet)
  })
  bot._client.on('respawn', (packet) => {
    const next = worldOf(packet)
    if (next !== world) sequence = 0
    world = next
  })
}
