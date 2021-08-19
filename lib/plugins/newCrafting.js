const assert = require('assert')
module.exports = (bot, { version }) => {
  const Item = require('prismarine-item')(version)
  const Recipe = require('prismarine-recipe')(version).Recipe

  bot.craft = craft
  bot.recipesFor = recipesFor

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
      await craftOnce(recipe, craftingWindow)
    }
    craftingWindow.close()
  }

  async function craftOnce (recipe, craftingWindow) {
    let y = 0
    let x = 1
    const recipeParts = recipe.inShape
    for (const row of recipeParts) {
      x = 1
      for (const item of row) {
        console.log('putting item into slot')
        await putItemInSlot(item, (y * 3) + x)
        console.log('done')
        x++
      }
      y++
    }
    // bot.inventory.findInventoryItem()
    // bot.clickWindow()
    console.log()
  }

  async function putItemInSlot (itemNeeded, slot) {
    if (itemNeeded.id === -1) return // this slot should be empty
    // ensure item on cursor
    if (!bot.currentWindow.selectedItem) {
      const itemInInventory = bot.inventory.findInventoryItem(itemNeeded.id)
      if (!itemInInventory) throw new Error(`Missing item with id: ${itemNeeded?.id} for recipe`)
      await bot.clickWindow(itemInInventory.slot, 0, 0)
    }
    // put item into slot
    await bot.clickWindow(slot, 1, 0) // right click so we only put one item into the slot
  }

  function recipesFor (itemType, metadata, minResultCount = 1, craftingTable) {
    return Recipe.find(itemType, metadata).filter(recipe => requirementsMetForRecipe(recipe, minResultCount, craftingTable))
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
}
