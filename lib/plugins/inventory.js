const assert = require('assert')
const { Vec3 } = require('vec3')
const { once } = require('events')
const { callbackify, sleep, createDoneTask, createTask } = require('../promise_utils')

module.exports = inject

// ms to wait before clicking on a tool so the server can send the new
// damage information
const DIG_CLICK_TIMEOUT = 500

function inject (bot, { version, hideErrors }) {
  const Item = require('prismarine-item')(version)
  const windows = require('prismarine-windows')(version)

  let eatingTask = createDoneTask()

  let nextActionNumber = 0
  const windowClickQueue = []
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

  async function putSelectedItemRange (start, end, window, slot, noWaiting = false) {
    // put the selected item back indow the slot range in window

    // try to put it in an item that already exists and just increase
    // the count.

    while (window.selectedItem) {
      const item = window.findItemRange(start, end, window.selectedItem.type, window.selectedItem.metadata, true, window.selectedItem.nbt)

      if (item && item.stackSize !== item.count) { // something to join with
        if (noWaiting) {
          await clickWindow(item.slot, 0, 0)
        } else {
          await Promise.all([clickWindow(item.slot, 0, 0), once(window, `updateSlot:${item.slot}`)])
        }
      } else { // nothing to join with
        const emptySlot = window.firstEmptySlotRange(start, end)
        if (emptySlot === null) { // no room left
          if (slot === null) { // no room => drop it
            await tossLeftover()
          } else { // if there is still some leftover and slot is not null, click slot
            await clickWindow(slot, 0, 0)
            await tossLeftover()
          }
        } else {
          if (noWaiting) {
            await Promise.all([clickWindow(emptySlot, 0, 0), once(window, `updateSlot:${emptySlot}`)])
          } else {
            await clickWindow(emptySlot, 0, 0)
          }
        }
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
    const nbt = options.nbt
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
        (metadata != null && window.selectedItem.metadata !== metadata) ||
        (nbt != null && window.selectedItem.nbt !== nbt)) {
        // we are not holding the item we need. click it.
        const sourceItem = window.findItemRange(sourceStart, sourceEnd, itemType, metadata, false, nbt)
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
            window.selectedItem.type, window.selectedItem.metadata, true, nbt)
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

  function extendWindow (window) {
    window.close = () => {
      window.emit('close')
      closeWindow(window)
    }
    window.withdraw = callbackify(async (itemType, metadata, count) => {
      const options = {
        window,
        itemType,
        metadata,
        count,
        sourceStart: 0,
        sourceEnd: window.inventoryStart,
        destStart: window.inventoryStart,
        destEnd: window.inventoryEnd
      }
      await transfer(options)
    })
    window.deposit = callbackify(async (itemType, metadata, count) => {
      const options = {
        window: window,
        itemType,
        metadata,
        count,
        sourceStart: window.inventoryStart,
        sourceEnd: window.inventoryEnd,
        destStart: 0,
        destEnd: window.inventoryStart
      }
      await transfer(options)
    })
  }

  async function openBlock (block) {
    bot.activateBlock(block)
    const [window] = await once(bot, 'windowOpen')
    extendWindow(window)
    return window
  }

  async function openEntity (entity) {
    bot.activateEntity(entity)
    const [window] = await once(bot, 'windowOpen')
    extendWindow(window)
    return window
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
        windowId: click.windowId,
        action: click.id,
        accepted: true
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
      throw new Error(`Server rejected transaction for clicking on slot ${slot}, on window ${JSON.stringify(window.slots, null, 2)}.`)
    }
  }

  async function putAway (slot, noWaiting = false) {
    const window = bot.currentWindow || bot.inventory
    const promisePutAway = once(window, `updateSlot:${slot}`)
    await clickWindow(slot, 0, 0)
    const start = window.inventoryStart
    const end = window.inventoryEnd
    await putSelectedItemRange(start, end, window, null, noWaiting)
    await promisePutAway
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

  function prepareWindow (window) {
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
  }

  bot._client.on('open_window', (packet) => {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      packet.inventoryType, packet.windowTitle, packet.slotCount)
    prepareWindow(bot.currentWindow)
  })
  bot._client.on('open_horse_window', (packet) => {
    // open window
    bot.currentWindow = windows.createWindow(packet.windowId,
      'HorseWindow', 'Horse', packet.nbSlots)
    prepareWindow(bot.currentWindow)
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
  bot.consume = callbackify(consume)
  bot.activateItem = activateItem
  bot.deactivateItem = deactivateItem

  // not really in the public API
  bot.clickWindow = callbackify(clickWindow)
  bot.putSelectedItemRange = putSelectedItemRange
  bot.putAway = putAway
  bot.closeWindow = closeWindow
  bot.transfer = callbackify(transfer)
  bot.openBlock = callbackify(openBlock)
  bot.openEntity = callbackify(openEntity)
  bot.moveSlotItem = callbackify(moveSlotItem)
  bot.updateHeldItem = updateHeldItem
}
