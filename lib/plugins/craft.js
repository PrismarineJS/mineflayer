const assert = require('assert')

module.exports = inject

function inject (bot, { version }) {
  const Item = require('prismarine-item')(version)
  const Recipe = require('prismarine-recipe')(version).Recipe

  function craft (recipe, count, craftingTable, cb) {
    assert.ok(recipe)
    cb = cb || noop
    count = count == null ? 1 : parseInt(count, 10)
    if (recipe.requiresTable && !craftingTable) {
      cb(new Error('recipe requires craftingTable'))
      return
    }
    next()
    function next (err) {
      if (err) {
        cb(err)
      } else if (count > 0) {
        count -= 1
        craftOnce(recipe, craftingTable, next)
      } else {
        cb()
      }
    }
  }

  function craftOnce (recipe, craftingTable, cb) {
    if (craftingTable) {
      bot.activateBlock(craftingTable)
      bot.once('windowOpen', (window) => {
        if (!window.type.startsWith('minecraft:crafting')) {
          cb(new Error('crafting: non craftingTable used as craftingTable'))
          return
        }
        startClicking(window, 3, 3)
      })
    } else {
      startClicking(bot.inventory, 2, 2)
    }

    function startClicking (window, w, h) {
      const extraSlots = unusedRecipeSlots()
      let ingredientIndex = 0
      let originalSourceSlot = null
      let it
      if (recipe.inShape) {
        it = {
          x: 0,
          y: 0,
          row: recipe.inShape[0]
        }
        clickShape()
      } else {
        nextIngredientsClick()
      }

      function incrementShapeIterator () {
        it.x += 1
        if (it.x >= it.row.length) {
          it.y += 1
          if (it.y >= recipe.inShape.length) return null
          it.x = 0
          it.row = recipe.inShape[it.y]
        }
        return it
      }

      function nextShapeClick () {
        if (incrementShapeIterator()) {
          clickShape()
        } else if (!recipe.ingredients) {
          putMaterialsAway()
        } else {
          nextIngredientsClick()
        }
      }

      function clickShape () {
        const destSlot = slot(it.x, it.y)
        const ingredient = it.row[it.x]
        if (ingredient.id === -1) return nextShapeClick()
        if (!window.selectedItem || window.selectedItem.type !== ingredient.id ||
          (ingredient.metadata != null &&
          window.selectedItem.metadata !== ingredient.metadata)) {
          // we are not holding the item we need. click it.
          const sourceItem = window.findInventoryItem(ingredient.id, ingredient.metadata)
          if (!sourceItem) return cb(new Error('missing ingredient'))
          if (originalSourceSlot == null) originalSourceSlot = sourceItem.slot
          bot.clickWindow(sourceItem.slot, 0, 0, (err) => {
            if (err) return cb(err)
            clickDest()
          })
        } else {
          clickDest()
        }
        function clickDest () {
          bot.clickWindow(destSlot, 1, 0, (err) => {
            if (err) {
              cb(err)
            } else {
              nextShapeClick()
            }
          })
        }
      }

      function nextIngredientsClick () {
        const ingredient = recipe.ingredients[ingredientIndex]
        const destSlot = extraSlots.pop()
        if (!window.selectedItem || window.selectedItem.type !== ingredient.id ||
          (ingredient.metadata != null &&
          window.selectedItem.metadata !== ingredient.metadata)) {
          // we are not holding the item we need. click it.
          const sourceItem = window.findInventoryItem(ingredient.id, ingredient.metadata)
          if (!sourceItem) return cb(new Error('missing ingredient'))
          if (originalSourceSlot == null) originalSourceSlot = sourceItem.slot
          bot.clickWindow(sourceItem.slot, 0, 0, clickDest)
        } else {
          clickDest()
        }
        function clickDest () {
          bot.clickWindow(destSlot, 1, 0, (err) => {
            if (err) {
              cb(err)
            } else if (++ingredientIndex < recipe.ingredients.length) {
              nextIngredientsClick()
            } else {
              putMaterialsAway()
            }
          })
        }
      }

      function putMaterialsAway () {
        const start = window.inventoryStart
        const end = window.inventoryEnd
        bot.putSelectedItemRange(start, end, window, originalSourceSlot, (err) => {
          if (err) {
            cb(err)
          } else {
            grabResult()
          }
        })
      }

      function grabResult () {
        assert.strictEqual(window.selectedItem, null)
        // put the recipe result in the output
        const item = new Item(recipe.result.id, recipe.result.count, recipe.result.metadata)
        window.updateSlot(0, item)
        // move the result to inventory
        bot.putAway(0, (err) => {
          if (err) {
            cb(err)
          } else {
            updateOutShape()
          }
        })
      }

      function updateOutShape () {
        if (!recipe.outShape) {
          for (let i = 1; i <= w * h; i++) {
            window.updateSlot(i, null)
          }
          closeTheWindow()
          return
        }
        const slotsToClick = []
        let x
        let y
        let row
        let item
        let theSlot
        for (y = 0; y < recipe.outShape.length; ++y) {
          row = recipe.outShape[y]
          for (x = 0; x < row.length; ++x) {
            theSlot = slot(x, y)
            if (row[x].id !== -1) {
              item = new Item(row[x].id, row[x].count, row[x].metadata || null)
              slotsToClick.push(theSlot)
            } else {
              item = null
            }
            window.updateSlot(theSlot, item)
          }
        }
        next()
        function next () {
          const theSlot = slotsToClick.pop()
          if (!theSlot) {
            closeTheWindow()
            return
          }
          bot.putAway(theSlot, (err) => {
            if (err) {
              cb(err)
            } else {
              next()
            }
          })
        }
      }

      function closeTheWindow () {
        bot.closeWindow(window)
        cb()
      }

      function slot (x, y) {
        return 1 + x + w * y
      }

      function unusedRecipeSlots () {
        const result = []
        let x
        let y
        let row
        if (recipe.inShape) {
          for (y = 0; y < recipe.inShape.length; ++y) {
            row = recipe.inShape[y]
            for (x = 0; x < row.length; ++x) {
              if (row[x].id === -1) result.push(slot(x, y))
            }
            for (; x < w; ++x) {
              result.push(slot(x, y))
            }
          }
          for (; y < h; ++y) {
            for (x = 0; x < w; ++x) {
              result.push(slot(x, y))
            }
          }
        } else {
          for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
              result.push(slot(x, y))
            }
          }
        }
        return result
      }
    }
  }

  function recipesFor (itemType, metadata, minResultCount, craftingTable) {
    minResultCount = minResultCount == null ? 1 : minResultCount
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

  bot.craft = craft
  bot.recipesFor = recipesFor
  bot.recipesAll = recipesAll
}

function noop (err) {
  if (err) throw err
}
