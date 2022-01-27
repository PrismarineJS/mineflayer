const assert = require('assert')

module.exports = () => async (bot) => {
  const {
    blocksByName,
    itemsByName,
    findItemOrBlockById
  } = require('minecraft-data')(bot.version)
  const Item = require('prismarine-item')(bot.version)

  function findCraftingTable () {
    return bot.findBlock({
      matching: blocksByName.crafting_table.id,
      maxDistance: 4.5
    })
  }

  async function fetchIngredients (recipe, iterations) {
    await bot.test.becomeCreative()
    await bot.test.clearInventory()

    let entries
    if (!recipe.inShape) {
      entries = recipe.ingredients
        .filter(entry => entry.count < 0)
        .map(entry => { return { id: entry.id, count: Math.abs(entry.count) } })
    } else { entries = extractItemsCountFromShape(recipe.inShape) }

    for (const entry of entries) {
      const item = findItemOrBlockById(entry.id)
      let remaining = entry.count * iterations
      while (remaining > 0) {
        const count = remaining > item.stackSize ? item.stackSize : remaining
        const emptySlotId = bot.inventory.firstEmptyInventorySlot(false)

        await bot.test.setInventorySlot(emptySlotId, new Item(item.id, count, null))
        remaining -= count
      }
    }

    await bot.test.becomeSurvival()
  }

  function assertRecipeResult (recipe, iterations) {
    const actualResultCount = bot.inventory.count(recipe.result.id, null)
    const expectedResultCount = recipe.result.count * iterations
    if (actualResultCount !== expectedResultCount) { throw new Error(`Craft ${findItemOrBlockById(recipe.result.id).name}: Mismatched result count. Expected ${expectedResultCount} Actual ${actualResultCount}`) }

    if (!recipe.outShape) { return }

    for (const entry of extractItemsCountFromShape(recipe.outShape)) {
      const actualCount = bot.inventory.count(entry.id, null)
      const expectedCount = entry.count * iterations

      if (actualResultCount !== expectedResultCount) { throw new Error(`Craft ${findItemOrBlockById(recipe.result.id).name}: Mismatched out shape count. Expected ${actualCount} Actual ${expectedCount}`) }
    }
  }

  function extractItemsCountFromShape (shape) {
    const outItemsMap = new Map()
    for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
      const row = shape[rowIndex]
      for (const entry of row) {
        if (entry.id === -1) { continue }
        outItemsMap.set(entry.id, (outItemsMap.get(entry.id) ?? 0) + entry.count)
      }
    }

    const result = []
    for (const [key, value] of outItemsMap.entries()) {
      result.push({
        id: key,
        count: value
      })
    }

    return result
  }

  const itemsToCraft = [
    { name: bot.supportFeature('blockSchemeIsFlat') ? 'birch_planks' : 'planks', iterations: 1 },
    { name: 'crafting_table', iterations: 1 },
    { name: 'stick', iterations: 9 },
    { name: 'ladder', iterations: 3 },
    { name: 'cake', iterations: 3 },
    { name: 'enchanting_table', iterations: 1 },
    { name: 'diamond_pickaxe', iterations: 2 },
    { name: 'iron_door', iterations: 2 },
    { name: 'diamond_block', iterations: 2 }
  ]

  await bot.test.setBlock({ x: 1, y: 0, z: 0, relative: true, blockName: 'crafting_table' })
  const craftingTable = findCraftingTable()

  for (const entry of itemsToCraft) {
    console.log('Starting to craft', entry.name, entry.iterations)
    const recipe = bot.recipesAll(itemsByName[entry.name].id, null, true)[0]
    assert.ok(recipe)

    await fetchIngredients(recipe, entry.iterations)
    await bot.craft(recipe, entry.iterations, craftingTable)
    assertRecipeResult(recipe, entry.iterations)
    console.log('Finished crafting', entry.name, entry.iterations)
  }
}
