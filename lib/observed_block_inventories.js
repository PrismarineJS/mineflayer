const blockContainers = new Set([
  'chest', 'trapped_chest', 'barrel', 'hopper', 'furnace', 'lit_furnace',
  'blast_furnace', 'smoker', 'dispenser', 'dropper', 'brewing_stand'
])

module.exports = function observedBlockInventories (bot) {
  let pending = null
  let active = null
  const observed = new Map()
  const snapshotItem = item => item === null ? null : structuredClone(item)

  function begin (block) {
    if (pending) throw new Error('A window is already being opened')
    const context = block
      ? {
          world: bot.world,
          position: block.position.floored(),
          type: block.type,
          kind: block.name,
          column: bot.world.getColumnAt(block.position)
        }
      : { entity: true }
    pending = context
    return context
  }

  function valid (context) {
    return context.world === bot.world &&
      context.column === bot.world.getColumnAt(context.position) &&
      bot.world.getBlock(context.position)?.type === context.type
  }

  function prepare (window, blockWindow) {
    const context = pending && !pending.prepared ? pending : null
    if (context) context.prepared = true
    if (active) close(active.window)
    return () => opened(window, blockWindow ? context : null)
  }

  function opened (window, context) {
    if (!context || context.entity || window !== bot.currentWindow || !valid(context)) return
    if (!blockContainers.has(context.kind) && !context.kind.endsWith('shulker_box')) return
    if (window.inventoryStart <= 0) return
    active = { ...context, window }
    const positions = observed.get(context.world) || new Map()
    positions.set(context.position.toString(), context.position)
    observed.set(context.world, positions)
    publish(window)
  }

  function publish (window) {
    active.world.setObservedBlockInventory(active.position, {
      kind: active.kind,
      slots: window.slots.slice(0, window.inventoryStart).map(snapshotItem),
      stale: false,
      observedAt: Date.now()
    })
  }

  function current (window) {
    return active && active.window === window && valid(active) &&
      active.world.getObservedBlockInventory(active.position) !== null
  }

  function updateAll (window) {
    if (current(window)) publish(window)
  }

  function updateSlot (window, index, item) {
    if (!current(window) || index < 0 || index >= window.inventoryStart) return
    const observation = active.world.getObservedBlockInventory(active.position)
    observation.slots[index] = snapshotItem(item)
    observation.observedAt = Date.now()
    active.world.setObservedBlockInventory(active.position, observation)
  }

  function close (window) {
    if (!active || active.window !== window) return
    if (current(window)) {
      const observation = active.world.getObservedBlockInventory(active.position)
      observation.stale = true
      active.world.setObservedBlockInventory(active.position, observation)
    }
    active = null
  }

  function reset () {
    for (const [world, positions] of observed) {
      for (const position of positions.values()) world.removeObservedBlockInventory(position)
    }
    observed.clear()
    pending = null
    active = null
  }

  return {
    begin,
    cancel: context => { if (pending === context) pending = null },
    prepare,
    updateAll,
    updateSlot,
    close,
    reset
  }
}
