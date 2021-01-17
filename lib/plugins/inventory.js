const assert = require('assert')
const Vec3 = require('vec3').Vec3
const { once } = require('events')
const { callbackify, sleep, createDoneTask, createTask } = require('../promise_utils')

module.exports = inject

// ms to wait before clicking on a tool so the server can send the new
// damage information
const DIG_CLICK_TIMEOUT = 500

function inject (bot, { version, hideErrors }) {
  const Item = require('prismarine-item')(version)
  const windows = require('prismarine-windows')(version)
  const mcData = require('minecraft-data')(bot.version)

  let bobberId = 90
  // Before 1.14 the bobber entity keep changing name at each version (but the id stays 90)
  // 1.14 changes the id, but hopefully we can stick with the name: fishing_bobber
  // the alternative would be to rename it in all version of mcData
  if (bot.supportFeature('fishingBobberCorrectlyNamed')) {
    bobberId = mcData.entitiesByName.fishing_bobber.id
  }

  let eatingTask = createDoneTask()
  let fishingTask = createDoneTask()

  let nextActionNumber = 0
  const windowClickQueue = []
  let lastFloat
  let windowItems

  // 0-8, null = uninitialized
  // which quick bar slot is selected
  bot.quickBarSlot = null
  bot.inventory = windows.createWindow(0, 'minecraft:inventory', 'Inventory')
  bot.currentWindow = null
  bot.heldItem = null

  bot._client.on('entity_status', (packet) => {
    if (packet.entityId === bot.entity.id && packet.entityStatus === 9 && !eatingTask.done) {
      eatingTask.finish()
    }
  })

  bot._client.on('spawn_entity', (packet) => {
    if (packet.type === bobberId && !fishingTask.done && !lastFloat) {
      lastFloat = bot.entities[packet.entityId]
    }
  })

  bot._client.on('world_particles', (packet) => {
    if (!lastFloat || fishingTask.done) return

    const pos = lastFloat.position
    if (packet.particleId === 4 && packet.particles === 6 && pos.distanceTo(new Vec3(packet.x, pos.y, packet.z)) <= 1.23) {
      activateItem()
      lastFloat = undefined
      fishingTask.finish()
    }
  })

  bot._client.on('entity_destroy', (packet) => {
    if (!lastFloat) return
    if (packet.entityIds.some(id => id === lastFloat.id)) {
      lastFloat = undefined
      fishingTask.cancel(new Error('Fishing cancelled'))
    }
  })

  async function consume () {
    if (!eatingTask.done) {
      eatingTask.cancel(new Error('Consuming cancelled due to calling bot.consume() again'))
    }

    if (bot.food === 20) {
      throw new Error('Food is full')
    }

    eatingTask = createTask()

    activateItem()

    await eatingTask.promise
  }

  async function fish () {
    if (!fishingTask.done) {
      fishingTask.cancel(new Error('Fishing cancelled due to calling bot.fish() again'))
    }

    fishingTask = createTask()

    activateItem()

    await fishingTask.promise
  }

  function activateItem (offHand = false) {
    if (bot.supportFeature('useItemWithBlockPlace')) {
      bot._client.write('block_place', {
        location: new Vec3(-1, 255, -1),
        direction: -1,
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: -1,
        cursorY: -1,
        cursorZ: -1
      })
    } else if (bot.supportFeature('useItemWithOwnPacket')) {
      bot._client.write('use_item', {
        hand: offHand ? 1 : 0
      })
    }
  }

  function deactivateItem () {
    bot._client.write('block_dig', {
      status: 5,
      location: new Vec3(0, 0, 0),
      face: 5
    })
  }

  async function putSelectedItemRange (start, end, window, slot) {
    // put the selected item back indow the slot range in window

    // try to put it in an item that already exists and just increase
    // the count.
    await tryToJoin()

    async function tryToJoin () {
      if (!window.selectedItem) {
        return
      }
      const item = window.findItemRange(start, end, window.selectedItem.type,
        window.selectedItem.metadata, true)
      if (item) {
        await clickWindow(item.slot, 0, 0)
        await tryToJoin()
      } else {
        await tryToFindEmpty()
      }
    }

    async function tryToFindEmpty () {
      const emptySlot = window.firstEmptySlotRange(start, end)
      if (emptySlot === null) {
        // if there is still some leftover and slot is not null, click slot
        if (slot === null) {
          await tossLeftover()
        } else {
          await clickWindow(slot, 0, 0)
          await tossLeftover()
        }
      } else {
        await clickWindow(emptySlot, 0, 0)
      }
    }

    async function tossLeftover () {
      if (window.selectedItem) {
        await clickWindow(-999, 0, 0)
      }
    }
  }

  async function activateBlock (block) {
    // TODO: tell the server that we are not sneaking while doing this
    await bot.lookAt(block.position.offset(0.5, 0.5, 0.5), false)
    // place block message
    if (bot.supportFeature('blockPlaceHasHeldItem')) {
      bot._client.write('block_place', {
        location: block.position,
        direction: 1,
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: 8,
        cursorY: 8,
        cursorZ: 8
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndIntCursor')) {
      bot._client.write('block_place', {
        location: block.position,
        direction: 1,
        hand: 0,
        cursorX: 8,
        cursorY: 8,
        cursorZ: 8
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndFloatCursor')) {
      bot._client.write('block_place', {
        location: block.position,
        direction: 1,
        hand: 0,
        cursorX: 0.5,
        cursorY: 0.5,
        cursorZ: 0.5
      })
    } else if (bot.supportFeature('blockPlaceHasInsideBlock')) {
      bot._client.write('block_place', {
        location: block.position,
        direction: 1,
        hand: 0,
        cursorX: 0.5,
        cursorY: 0.5,
        cursorZ: 0.5,
        insideBlock: false
      })
    }

    // swing arm animation
    bot.swingArm()
  }

  async function activateEntity (entity) {
    // TODO: tell the server that we are not sneaking while doing this
    await bot.lookAt(entity.position.offset(0, 1, 0), false)
    bot._client.write('use_entity', {
      target: entity.id,
      mouse: 0,
      sneaking: false
    })
  }

  async function activateEntityAt (entity, position) {
    // TODO: tell the server that we are not sneaking while doing this
    await bot.lookAt(position, false)
    bot._client.write('use_entity', {
      target: entity.id,
      mouse: 2,
      sneaking: false,
      x: position.x - entity.position.x,
      y: position.y - entity.position.y,
      z: position.z - entity.position.z
    })
  }

  async function transfer (options) {
    const window = options.window || bot.currentWindow || bot.inventory
    const itemType = options.itemType
    const metadata = options.metadata
    let count = options.count === null ? 1 : options.count
    let firstSourceSlot = null

    // ranges
    const sourceStart = options.sourceStart
    const destStart = options.destStart
    assert.notStrictEqual(sourceStart, null)
    assert.notStrictEqual(destStart, null)
    const sourceEnd = options.sourceEnd === null ? sourceStart + 1 : options.sourceEnd
    const destEnd = options.destEnd === null ? destStart + 1 : options.destEnd

    await transferOne()

    async function transferOne () {
      if (count === 0) {
        await putSelectedItemRange(sourceStart, sourceEnd, window, firstSourceSlot)
        return
      }
      if (!window.selectedItem || window.selectedItem.type !== itemType ||
        (metadata != null && window.selectedItem.metadata !== metadata)) {
        // we are not holding the item we need. click it.
        const sourceItem = window.findItemRange(sourceStart, sourceEnd, itemType, metadata)
        if (!sourceItem) throw new Error(`missing source item ${itemType}:${metadata} in (${sourceStart},${sourceEnd})`)
        if (firstSourceSlot === null) firstSourceSlot = sourceItem.slot
        // number of item that can be moved from that slot
        await clickWindow(sourceItem.slot, 0, 0)
      }
      await clickDest()

      async function clickDest () {
        assert.notStrictEqual(window.selectedItem.type, null)
        assert.notStrictEqual(window.selectedItem.metadata, null)
        let destItem
        let destSlot
        // special case for tossing
        if (destStart === -999) {
          destSlot = -999
        } else {
          // find a non full item that we can drop into
          destItem = window.findItemRange(destStart, destEnd,
            window.selectedItem.type, window.selectedItem.metadata, true)
          // if that didn't work find an empty slot to drop into
          destSlot = destItem
            ? destItem.slot
            : window.firstEmptySlotRange(destStart, destEnd)
          // if that didn't work, give up
          if (destSlot === null) {
            throw new Error('destination full')
          }
        }
        // move the maximum number of item that can be moved
        const destSlotCount = destItem && destItem.count ? destItem.count : 0
        const movedItems = Math.min(window.selectedItem.stackSize - destSlotCount, window.selectedItem.count)
        // if the number of item the left click moves is less than the number of item we want to move
        // several at the same time (left click)
        if (movedItems <= count) {
          await clickWindow(destSlot, 0, 0)
          // update the number of item we want to move (count)
          count -= movedItems
          await transferOne()
        } else {
          // one by one (right click)
          await clickWindow(destSlot, 1, 0)
          count -= 1
          await transferOne()
        }
      }
    }
  }

  function openBlock (block, Class) {
    const session = new Class()
    session.close = close
    bot.once('windowOpen', onWindowOpen)
    bot.activateBlock(block)
    return session
    function onWindowOpen (window) {
      if (!Class.matchWindowType(window.type)) return
      session.window = window
      bot.once('windowClose', onClose)
      bot.on(`setSlot:${window.id}`, onSetSlot)
      session.emit('open')
    }

    function close () {
      assert.notStrictEqual(session.window, null)
      closeWindow(session.window)
    }

    function onClose () {
      bot.removeListener(`setSlot:${session.window.id}`, onSetSlot)
      session.window = null
      session.emit('close')
    }

    function onSetSlot (oldItem, newItem) {
      session.emit('updateSlot', oldItem, newItem)
    }
  }

  function openEntity (entity, Class) {
    const session = new Class()
    session.close = callbackify(close)
    bot.once('windowOpen', onWindowOpen)
    bot.activateEntity(entity)
    return session

    function onWindowOpen (window) {
      if (!Class.matchWindowType(window.type)) return
      session.window = window
      bot.once('windowClose', onClose)
      bot.on(`setSlot:${window.id}`, onSetSlot)
      session.emit('open')
    }

    async function close () {
      const closeEvent = once(bot, 'windowClose')
      closeWindow(session.window)
      await closeEvent
    }

    function onClose () {
      bot.removeListener(`setSlot:${session.window.id}`, onSetSlot)
      session.window = null
      session.emit('close')
    }

    function onSetSlot (oldItem, newItem) {
      if (!Item.equal(oldItem, newItem)) {
        session.emit('updateSlot', oldItem, newItem)
      }
    }
  }

  async function placeBlock (referenceBlock, faceVector) {
    if (!bot.heldItem) throw new Error('must be holding an item to place a block')
    // Look at the center of the face
    const dx = 0.5 + faceVector.x * 0.5
    const dy = 0.5 + faceVector.y * 0.5
    const dz = 0.5 + faceVector.z * 0.5
    await bot.lookAt(referenceBlock.position.offset(dx, dy, dz), false)
    // TODO: tell the server that we are sneaking while doing this
    bot.swingArm()
    const pos = referenceBlock.position

    if (bot.supportFeature('blockPlaceHasHeldItem')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        heldItem: Item.toNotch(bot.heldItem),
        cursorX: 8,
        cursorY: 8,
        cursorZ: 8
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndIntCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: 0,
        cursorX: 8,
        cursorY: 8,
        cursorZ: 8
      })
    } else if (bot.supportFeature('blockPlaceHasHandAndFloatCursor')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: 0,
        cursorX: 0.5,
        cursorY: 0.5,
        cursorZ: 0.5
      })
    } else if (bot.supportFeature('blockPlaceHasInsideBlock')) {
      bot._client.write('block_place', {
        location: pos,
        direction: vectorToDirection(faceVector),
        hand: 0,
        cursorX: 0.5,
        cursorY: 0.5,
        cursorZ: 0.5,
        insideBlock: false
      })
    }

    const dest = pos.plus(faceVector)
    const eventName = `blockUpdate:${dest}`

    const [oldBlock, newBlock] = await once(bot, eventName)

    if (oldBlock.type === newBlock.type) {
      throw new Error(`No block has been placed : the block is still ${oldBlock.name}`)
    }
  }

  function createActionNumber () {
    nextActionNumber = nextActionNumber === 32767 ? 1 : nextActionNumber + 1
    return nextActionNumber
  }

  function updateHeldItem () {
    bot.heldItem = bot.inventory.slots[bot.QUICK_BAR_START + bot.quickBarSlot]
    bot.entity.heldItem = bot.heldItem
    bot.emit('heldItemChanged', bot.entity.heldItem)
  }

  function closeWindow (window) {
    bot._client.write('close_window', {
      windowId: window.id
    })
    bot.currentWindow = null
    bot.emit('windowClose', window)
  }

  function confirmTransaction (windowId, actionId, accepted) {
    // drop the queue entries for all the clicks that the server did not send
    // transaction packets for.
    let click = windowClickQueue.shift()
    if (click === undefined) {
      if (!hideErrors) {
        console.log(`WARNING : unknown transaction confirmation for window ${windowId}, action ${actionId} and accepted ${accepted}`)
      }
      return
    }
    assert.ok(click.id <= actionId)
    while (actionId > click.id) {
      onAccepted()
      click = windowClickQueue.shift()
    }
    assert.ok(click)

    if (accepted) {
      onAccepted()
    } else {
      onRejected()
    }
    updateHeldItem()

    function onAccepted () {
      const window = windowId === 0 ? bot.inventory : bot.currentWindow
      if (!window || window.id !== click.windowId) return
      window.acceptClick(click)
      bot.emit(`confirmTransaction${click.id}`, true)
    }

    function onRejected () {
      bot._client.write('transaction', {
        windowId: 0,
        action: click.id,
        accepted: false
      })
      bot.emit(`confirmTransaction${click.id}`, false)
    }
  }

  async function clickWindow (slot, mouseButton, mode) {
    // if you click on the quick bar and have dug recently,
    // wait a bit
    if (slot >= bot.QUICK_BAR_START && bot.lastDigTime != null) {
      let timeSinceLastDig
      while ((timeSinceLastDig = new Date() - bot.lastDigTime) < DIG_CLICK_TIMEOUT) {
        await sleep(DIG_CLICK_TIMEOUT - timeSinceLastDig)
      }
    }
    const window = bot.currentWindow || bot.inventory

    assert.ok(mouseButton === 0 || mouseButton === 1)
    assert.strictEqual(mode, 0)
    const actionId = createActionNumber()

    const click = {
      slot,
      mouseButton,
      mode,
      id: actionId,
      windowId: window.id,
      item: slot === -999 ? null : window.slots[slot]
    }
    windowClickQueue.push(click)
    bot._client.write('window_click', {
      windowId: window.id,
      slot,
      mouseButton,
      action: actionId,
      mode,
      item: Item.toNotch(click.item)
    })

    const response = once(bot, `confirmTransaction${actionId}`)

    // notchian servers are assholes and only confirm certain transactions.
    if (!window.transactionRequiresConfirmation(click)) {
      // jump the gun and accept the click
      confirmTransaction(window.id, actionId, true)
    }

    const [success] = await response
    if (!success) {
      throw new Error('Server rejected transaction.')
    }
  }

  async function putAway (slot) {
    await clickWindow(slot, 0, 0)
    const window = bot.currentWindow || bot.inventory
    const start = window.inventoryStart
    const end = window.inventoryEnd
    await putSelectedItemRange(start, end, window, null)
  }

  async function moveSlotItem (sourceSlot, destSlot) {
    await clickWindow(sourceSlot, 0, 0)
    await clickWindow(destSlot, 0, 0)
    // if we're holding an item, put it back where the source item was.
    // otherwise we're done.
    updateHeldItem()
    if (bot.inventory.selectedItem) {
      await clickWindow(sourceSlot, 0, 0)
    }
  }

  bot._client.on('transaction', (packet) => {
    // confirm transaction
    if (packet.action < 0) {
      return
    }
    confirmTransaction(packet.windowId, packet.action, packet.accepted)
  })

  bot._client.on('held_item_slot', (packet) => {
    // held item change
    bot.setQuickBarSlot(packet.slot)
  })

  bot._client.on('open_window', (packet) => {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      packet.inventoryType, packet.windowTitle, packet.slotCount)
    const window = bot.currentWindow
    if (!windowItems || window.id !== windowItems.windowId) {
      // don't emit windowOpen until we have the slot data
      bot.once(`setWindowItems:${window.id}`, () => {
        bot.emit('windowOpen', window)
      })
    } else {
      for (let i = 0; i < windowItems.items.length; ++i) {
        const item = Item.fromNotch(windowItems.items[i])
        window.updateSlot(i, item)
      }
      updateHeldItem()
      bot.emit('windowOpen', window)
    }
  })
  bot._client.on('open_horse_window', (packet) => {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      'HorseWindow', 'Horse', packet.nbSlots)
    const window = bot.currentWindow
    if (!windowItems || window.id !== windowItems.windowId) {
      // don't emit windowOpen until we have the slot data
      bot.once(`setWindowItems:${window.id}`, () => {
        bot.emit('windowOpen', window)
      })
    } else {
      for (let i = 0; i < windowItems.items.length; ++i) {
        const item = Item.fromNotch(windowItems.items[i])
        window.updateSlot(i, item)
      }
      updateHeldItem()
      bot.emit('windowOpen', window)
    }
  })
  bot._client.on('close_window', (packet) => {
    // close window
    const oldWindow = bot.currentWindow
    bot.currentWindow = null
    bot.emit('windowClose', oldWindow)
  })
  bot._client.on('set_slot', (packet) => {
    // set slot
    const window = packet.windowId === 0 ? bot.inventory : bot.currentWindow
    if (!window || window.id !== packet.windowId) return
    const newItem = Item.fromNotch(packet.item)
    const oldItem = window.slots[packet.slot]
    window.updateSlot(packet.slot, newItem)
    updateHeldItem()
    bot.emit(`setSlot:${window.id}`, oldItem, newItem)
  })
  bot._client.on('window_items', (packet) => {
    const window = packet.windowId === 0 ? bot.inventory : bot.currentWindow
    if (!window || window.id !== packet.windowId) {
      windowItems = packet
      return
    }

    // set window items
    for (let i = 0; i < packet.items.length; ++i) {
      const item = Item.fromNotch(packet.items[i])
      window.updateSlot(i, item)
    }
    updateHeldItem()
    bot.emit(`setWindowItems:${window.id}`)
  })

  bot.activateBlock = callbackify(activateBlock)
  bot.activateEntity = callbackify(activateEntity)
  bot.activateEntityAt = callbackify(activateEntityAt)
  bot.placeBlock = callbackify(placeBlock)
  bot.consume = callbackify(consume)
  bot.fish = callbackify(fish)
  bot.activateItem = activateItem
  bot.deactivateItem = deactivateItem

  // not really in the public API
  bot.clickWindow = callbackify(clickWindow)
  bot.putSelectedItemRange = callbackify(putSelectedItemRange)
  bot.putAway = callbackify(putAway)
  bot.closeWindow = closeWindow
  bot.transfer = callbackify(transfer)
  bot.openBlock = openBlock
  bot.openEntity = openEntity
  bot.moveSlotItem = callbackify(moveSlotItem)
  bot.updateHeldItem = updateHeldItem
}

function vectorToDirection (v) {
  if (v.y < 0) {
    return 0
  } else if (v.y > 0) {
    return 1
  } else if (v.z < 0) {
    return 2
  } else if (v.z > 0) {
    return 3
  } else if (v.x < 0) {
    return 4
  } else if (v.x > 0) {
    return 5
  }
  assert.ok(false, `invalid direction vector ${v}`)
}
