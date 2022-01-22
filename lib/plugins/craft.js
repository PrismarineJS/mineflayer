const assert = require('assert')
const { once } = require('events')
const { callbackify } = require('../promise_utils')

module.exports = inject

function inject (bot, { version }) {
  const Recipe = require('prismarine-recipe')(version).Recipe

  const craftingTableSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const inventoryCraftingSlots = [1, 2, 3, 4]
  const resultSlot = 0

  async function craft (recipe, count = 1, craftingTable) {
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

      let currentSlot = 1
      for (let rowNr = 0; rowNr < recipe.inShape.length; rowNr++) {
        const row = recipe.inShape[rowNr]
        for (const entry of row) {
          if (entry.id === -1) {
            currentSlot++
            continue
          }

          if (window.selectedItem && (window.selectedItem.type !== entry.id || (entry.metadata != null && window.selectedItem.metadata !== entry.metadata))) {
            await putSelectedItemAway(window)
          }

          if (!window.selectedItem) {
            const item = window.findInventoryItem(entry.id, entry.metadata, false)
            if (!item) {
              throw new Error('insufficient amount of items in inventory')
            }
            await bot.clickWindow(item.slot, 0, 0)
          }
          await bot.clickWindow(currentSlot, 1, 0)
          currentSlot++
        }

        currentSlot = (rowNr + 1) * (craftingTable ? 3 : 2) + 1 // row might not be completely filled with items, skip to first slot of next row
      }
      await putSelectedItemAway(window)

      await bot.clickWindow(resultSlot, 0, 0)
      await putSelectedItemAway(window)

      await emptyCraftingField(window) // Needed if out shape is not null (crafting cake leaves empty buckets)
      remainingCount -= resultCount
    }
    bot.closeWindow(window)
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

  async function emptyCraftingField (window) {
    const isCraftingTable = typeof window.type !== 'number' && window.type.startsWith('minecraft:crafting')
    const slotCount = isCraftingTable ? craftingTableSlots.length : inventoryCraftingSlots.length

    for (let slotId = 1; slotId < slotCount; slotId++) {
      const slot = window.slots[slotId]
      if (!slot || slot.count === 0) {
        continue
      }

      await bot.clickWindow(slotId, 0, 0)
      await putSelectedItemAway(window)
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
