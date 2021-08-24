const assert = require('assert')
module.exports = (bot, { version }) => {
  const Item = require('prismarine-item')(version)
  const Recipe = require('prismarine-recipe')(version).Recipe

  bot.craft = craft
  bot.recipesFor = (itemType, metadata, minResultCount = 1, craftingTable) => Recipe.find(itemType, metadata).filter(recipe => requirementsMetForRecipe(recipe, minResultCount, craftingTable))
  bot.recipesAll = (itemType, metadata, craftingTable) => Recipe.find(itemType, metadata).filter(recipe => !recipe.requiresTable || craftingTable)

  const getCurrentWindow = () => bot.currentWindow ?? bot.inventory
  const getWindowWidth = () => bot.currentWindow ? 3 : 2

  /**
   *
   * @param {import('prismarine-recipe').Recipe} recipe
   * @param {number} count
   * @param {import('prismarine-block').Block} craftingTable
   */
  async function craft (recipe, count = 1, craftingTable) {
    count = +count
    assert.ok(recipe, 'Need to give a recipe to craft.')
    assert(recipe.requiresTable ? craftingTable?.name === 'crafting_table' : true, 'Need to provide a crafting table for this recipe')
    const craftingWindow = recipe.requiresTable ? await bot.openContainer(craftingTable) : true

    for (let i = 0; i < count; i++) {
      if (!craftingWindow) throw new Error('Crafting table closed while crafting')
      await craftOnce(recipe)
      await clearCursor()
      await takeResults(recipe)
      await clearCraftingWindow()
    }
    if (recipe.requiresTable) {
      craftingWindow.close()
    }
  }
  async function craftOnce (recipe) {
    const max = getWindowWidth()
    if (recipe.inShape) {
      const recipeParts = recipe.inShape
      for (const [y, row] of Object.entries(recipeParts)) {
        for (const [x, item] of Object.entries(row)) {
          const slot = +x + 1 + max * +y
          await putItemInSlot(item, slot)
        }
      }
    } else {
      let y = 0
      let x = 1
      for (const item of recipe.ingredients) {
        if (x !== max) x++
        else {
          x = 1
          y++
        }
        await putItemInSlot(item, y * max + x)
      }
    }
  }

  async function putItemInSlot (itemNeeded, slot) {
    if (itemNeeded.id === -1) {
      return // this slot should be empty
    }
    // ensure item on cursor
    const window = getCurrentWindow()
    if (!window.selectedItem) {
      const itemInInventory = window.findInventoryItem(itemNeeded.id)
      if (!itemInInventory) throw new Error(`Missing item with id: ${itemNeeded?.id} for recipe`)
      await bot.clickWindow(itemInInventory.slot, 0, 0)
    }
    // put item into slot
    await bot.clickWindow(slot, 1, 0) // right click so we only put one item into the slot
  }

  function requirementsMetForRecipe (recipe, minResultCount, craftingTable) {
    if (recipe.requiresTable && !craftingTable) return false

    // how many times we have to perform the craft to achieve minResultCount
    const craftCount = Math.ceil(minResultCount / recipe.result.count)
    return recipe.delta.every(recipeItem => {
      if (recipeItem.count > -1) return true // we only care about things we will use as part of the recipe
      const count = bot.inventory.count(recipeItem.id, recipeItem.metadata) // negative number for how many we will use during crafting
      return (recipeItem.count * craftCount) + count >= 0 // (-# per recipe * recipeCount) + (positive # of items in our inventory) > 0, which means we have enough materials for the craft
    })
  }

  async function clearCursor () {
    const window = getCurrentWindow()
    if (window.selectedItem) {
      const emptySlot = window.firstEmptyInventorySlot()
      await bot.clickWindow(emptySlot, 0, 0)
    }
  }

  async function takeResults (recipe) {
    const window = getCurrentWindow()
    assert.strictEqual(window.selectedItem, null, "Shouldn't have anything on cursor after done crafting")
    // Causes a double-emit on 1.12+ --nickelpro
    // put the recipe result in the output
    const item = new Item(recipe.result.id, recipe.result.count, recipe.result.metadata)
    window.updateSlot(0, item)
    await bot.putAway(0)
  }

  async function clearCraftingWindow () {
    const window = getCurrentWindow()
    const slotsToClear = window.slots
      .filter(item => item) // get rid of nulls
      .filter(item => item.slot >= 1 && item.slot <= getWindowWidth() ** 2) // get all items from slot 1 to 4 || 9 depending on whether we are using a crafting table

    for (const item of slotsToClear) {
      await bot.clickWindow(item.slot, 0, 0)
      const emptySlot = window.firstEmptyInventorySlot()
      await bot.clickWindow(emptySlot, 0, 0)
    }
  }
}