const assert = require('assert')
const { once } = require('events')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)
  const Recipe = require('prismarine-recipe')(version).Recipe

  const craftingTableSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const inventoryCraftingSlots = [1, 2, 3, 4]
  const resultSlot = 0

  async function craft (recipe, count, craftingTable) {
    assert.ok(recipe)

    if (recipe.requiresTable && !craftingTable) {
      throw new Error('recipe requires craftingTable')
    }

    let window = bot.inventory
    if (craftingTable) {
      window = await acquireCraftingTable(craftingTable)
    }

    let remainingCount = count
    while (remainingCount > 0) {
      const resultCount = recipe.result.count

      if (recipe.inShape) {
        await craftShape(recipe, window, craftingTable)
      } else {
        await craftShapeless(recipe, window)
      }

      await grabResult(window, recipe)
      await emptyCraftingField(window, recipe)
      remainingCount -= resultCount
    }
    await bot.closeWindow(window)
  }

  async function craftShape (recipe, window, craftingTable) {
    let currentSlot = 1
    for (let rowIndex = 0; rowIndex < recipe.inShape.length; rowIndex++) {
      const row = recipe.inShape[rowIndex]
      for (const entry of row) {
        if (entry.id === -1) {
          currentSlot++
          continue
        }

        await pickupItem(window, entry)
        await bot.clickWindow(currentSlot, 1, 0)
        currentSlot++
      }

      currentSlot = (rowIndex + 1) * (craftingTable ? 3 : 2) + 1 // row might not be completely filled with items, skip to first slot of next row
    }
    await putSelectedItemAway(window)
  }

  async function craftShapeless (recipe, window) {
    assert.ok(recipe.ingredients.length === 1)
    const entry = recipe.ingredients[0]

    await pickupItem(window, entry)
    await bot.clickWindow(1, 1, 0)
    await putSelectedItemAway(window)
  }

  async function grabResult (window, recipe) {
    // Since 1.12, the server sends a packet to update the result slot.
    // This would double emit a slot update -> only for previous versions --nickelpro
    if (!bot.supportFeature('craftingResultSlotUpdate')) {
      const item = new Item(recipe.result.id, recipe.result.count, recipe.result.metadata)
      window.updateSlot(resultSlot, item)
    }

    await bot.clickWindow(resultSlot, 0, 0)
    await putSelectedItemAway(window)
  }

  async function pickupItem (window, item) {
    if (window.selectedItem && (window.selectedItem.type !== item.id || (item.metadata != null && window.selectedItem.metadata !== item.metadata))) {
      await putSelectedItemAway(window)
    }

    if (!window.selectedItem) {
      const inventoryItem = window.findInventoryItem(item.id, item.metadata, false)
      if (!inventoryItem) {
        throw new Error('insufficient amount of items in inventory')
      }
      await bot.clickWindow(inventoryItem.slot, 0, 0)
    }
  }

  async function acquireCraftingTable (block) {
    bot.activateBlock(block)
    const [window] = await once(bot, 'windowOpen')
    if (!window.type.startsWith('minecraft:crafting')) {
      throw new Error('crafting: non craftingTable used as craftingTable')
    }

    return window
  }

  async function putSelectedItemAway (window) {
    if (!window.selectedItem) {
      return
    }
    let remainingCount = window.selectedItem.count

    const startedItemStack = window.findInventoryItem(window.selectedItem.type, window.selectedItem.metadata, true)
    if (startedItemStack) {
      const remainingSlotSize = startedItemStack.stackSize - startedItemStack.count

      await bot.clickWindow(startedItemStack.slot, 0, 0)
      remainingCount -= remainingSlotSize

      if (remainingCount > 0) {
        return putSelectedItemAway(window)
      }
    } else {
      const emptySlot = window.firstEmptyInventorySlot(false)
      if (!emptySlot) {
        throw new Error('Unable to put away held item. No space in inventory')
      }

      await bot.clickWindow(emptySlot, 0, 0)
    }
  }

  /**
     * Some recipes (cake) leave items in the crafting area after crafting. We need to clean them up.
     * Sadly, the server does not update the crafting area after an item has been crafted (except Paper?).
     * This dictates that we need to read the recipes outShape and collect those items.
     * Additionally, we need to null all crafting area slots.
     * @param window
     * @param recipe
     * @returns {Promise<void>}
     */
  async function emptyCraftingField (window, recipe) {
    const isCraftingTable = typeof window.type !== 'number' && window.type.startsWith('minecraft:crafting')
    const slotCount = isCraftingTable ? craftingTableSlots.length : inventoryCraftingSlots.length

    if (!recipe.outShape) {
      for (let i = 1; i <= slotCount; i++) {
        window.updateSlot(i, null)
      }
      return
    }

    let currentSlot = 1
    for (let rowIndex = 0; rowIndex < recipe.outShape.length; rowIndex++) {
      const row = recipe.outShape[rowIndex]
      for (const entry of row) {
        if (entry.id === -1) {
          window.updateSlot(currentSlot++, null)
          continue
        }

        window.updateSlot(currentSlot, new Item(entry.id, entry.count, entry.metadata))
        await bot.clickWindow(currentSlot, 0, 0)
        await putSelectedItemAway(window)
        currentSlot++
      }

      currentSlot = (rowIndex + 1) * (isCraftingTable ? 3 : 2) + 1 // row might not be completely filled with items, skip to first slot of next row
    }
  }

  function recipesFor (itemType, metadata, minResultCount, craftingTable) {
    minResultCount = minResultCount ?? 1
    const results = []
    Recipe.find(itemType, metadata).forEach((recipe) => {
      if (requirementsMetForRecipe(recipe, minResultCount, craftingTable)) {
        results.push(recipe)
      }
    })
    return results
  }

  function recipesAll (itemType, metadata, craftingTable) {
    const results = []
    Recipe.find(itemType, metadata).forEach((recipe) => {
      if (!recipe.requiresTable || craftingTable) {
        results.push(recipe)
      }
    })
    return results
  }

  function requirementsMetForRecipe (recipe, minResultCount, craftingTable) {
    if (recipe.requiresTable && !craftingTable) return false

    // how many times we have to perform the craft to achieve minResultCount
    const craftCount = Math.ceil(minResultCount / recipe.result.count)

    // false if not enough inventory to make all the ones that we want
    for (let i = 0; i < recipe.delta.length; ++i) {
      const d = recipe.delta[i]
      if (bot.inventory.count(d.id, d.metadata) + d.count * craftCount < 0) return false
    }

    // otherwise true
    return true
  }

  bot.craft = callbackify(craft)
  bot.recipesFor = recipesFor
  bot.recipesAll = recipesAll
}
