const assert = require('assert')

// A click sent from a stale model is rejected (pre-1.17) or corrected
// (1.17.1+), and either way the server's reply carries the cursor. The model
// must take it, or every later click sends the wrong cursor.
module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)
  const stoneId = bot.registry.itemsByName.stone.id
  await bot.test.setInventorySlot(36, new Item(stoneId, 1))
  await bot.clickWindow(36, 0, 0)
  assert.strictEqual(bot.inventory.selectedItem?.type, stoneId, 'stone should be on the cursor')

  // Registered before the click, and after the plugin's own listeners, so it
  // settles once the plugin has applied the server's empty cursor.
  const emptyCursor = awaitServerCursor(bot, Item, (item) => item === null)

  // Pretend slot 30 holds a dirt the server never gave us, so the click
  // predicts a swap the server does not perform.
  bot.inventory.updateSlot(30, new Item(bot.registry.itemsByName.dirt.id, 1))
  // Pre-1.17 servers report the mismatch as a rejection, which throws.
  await bot.clickWindow(30, 0, 0).catch(() => {})
  await emptyCursor

  assert.strictEqual(bot.inventory.selectedItem, null, 'the cursor should be empty like the server\'s')
  assert.strictEqual(bot.inventory.slots[30]?.type, stoneId)
  await bot.moveSlotItem(30, 36)
  // These clicks match the server, so on 1.17.1+ it answers nothing, and on
  // 1.21.9+ the next test's /clear can overtake them: the clicks then carry
  // a stateId the clear bumped, and the server's full resync lands mid-test.
  // A stats round trip is queued behind the clicks, so any correction has
  // arrived by its answer and the model below is the server's.
  await awaitServerProcessed(bot)
  assert.strictEqual(bot.inventory.slots[36]?.type, stoneId)
  assert.strictEqual(bot.inventory.slots[30], null)
  assert.strictEqual(bot.inventory.selectedItem, null)
}

// The server answers a stats request after every packet sent before it.
function awaitServerProcessed (bot, timeout = 5000) {
  const answered = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      bot._client.removeListener('statistics', onStats)
      reject(new Error('the server never answered the stats request'))
    }, timeout)
    function onStats () {
      clearTimeout(timer)
      resolve()
    }
    bot._client.once('statistics', onStats)
  })
  bot._client.write('client_command', bot.supportFeature('respawnIsPayload') ? { payload: 1 } : { actionId: 'request_stats' })
  return answered
}

// Resolves on the first packet that sets the cursor to an item matching
// `condition`: set_slot on window -1 (255 where the id is a varint),
// window_items carrying it (1.17.1+), or set_cursor_item (1.21.3+).
function awaitServerCursor (bot, Item, condition, timeout = 5000) {
  const listeners = {
    set_slot: (packet) => (packet.windowId === -1 || packet.windowId === 255) && check(packet.item),
    window_items: (packet) => packet.windowId === 0 && packet.carriedItem !== undefined && check(packet.carriedItem),
    // 1.21.3's schema makes an empty cursor an absent field
    set_cursor_item: (packet) => check(packet.contents)
  }
  let finish
  const check = (notch) => {
    const item = notch === undefined ? null : Item.fromNotch(notch)
    if (condition(item)) finish()
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error('the server never sent the expected cursor')), timeout)
    finish = (err) => {
      clearTimeout(timer)
      for (const [name, listener] of Object.entries(listeners)) bot._client.removeListener(name, listener)
      err ? reject(err) : resolve()
    }
    for (const [name, listener] of Object.entries(listeners)) bot._client.on(name, listener)
  })
}
