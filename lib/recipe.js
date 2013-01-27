var recipes = require('./enums/recipes');

module.exports = Recipe;

function Recipe(recipeEnumItem) {
  this.type = recipeEnumItem.type;
  this.count = recipeEnumItem.count;
  this.metadata = recipeEnumItem.metadata;

  var x, y, row, myRow;
  this.inShape = recipeEnumItem.inShape ?
    reformatShape(recipeEnumItem.inShape) : null;
  this.outShape = recipeEnumItem.outShape ?
    reformatShape(recipeEnumItem.outShape) : null;
  this.ingredients = recipeEnumItem.ingredients ?
    reformatIngredients(recipeEnumItem.ingredients) : null;
  this.delta = computeDelta(this);
  this.requiresTable = computeRequiresTable(this);
}

Recipe.find = function(itemType, metadata) {
  var results = [];
  (recipes[itemType] || []).forEach(function(recipeEnumItem) {
    if ((metadata == null || recipeEnumItem.metadata === metadata)) {
      results.push(new Recipe(recipeEnumItem));
    }
  });
  return results;
};

function computeRequiresTable(recipe) {
  var spaceLeft = 4;

  var x, y, row;
  if (recipe.inShape) {
    if (recipe.inShape.length > 2) return true;
    for (y = 0; y < recipe.inShape.length; ++y) {
      row = recipe.inShape[y];
      if (row.length > 2) return true;
      for (x = 0; x < row.length; ++x) {
        if (row[x]) spaceLeft -= 1;
      }
    }
  }
  if (recipe.ingredients) spaceLeft -= recipe.ingredients.length;
  return spaceLeft < 0;
}

function computeDelta(recipe) {
  // returns a map of item type to a delta how many more or less you will
  // have in your inventory after crafting
  var delta = {};
  if (recipe.inShape) applyShape(recipe.inShape, -1);
  if (recipe.outShape) applyShape(recipe.outShape, 1);
  if (recipe.ingredients) applyIngredients(recipe.ingredients);
  // add the result
  delta[recipe.type] = recipe.count;
  return delta;

  function applyShape(shape, direction) {
    var x, y, row, id;
    for (y = 0; y < shape.length; ++y) {
      row = recipe.inShape[y];
      for (x = 0; x < row.length; ++x) {
        id = row[x].id;
        if (id != null) {
          delta[id] = delta[id] ? delta[id] + direction : direction;
        }
      }
    }
  }

  function applyIngredients(ingredients) {
    var i, id;
    for (i = 0; i < ingredients; ++i) {
      id = ingredients[i].id;
      delta[id] = delta[id] ? delta[id] - 1 : -1;
    }
  }
}

function reformatShape(shape) {
  var out = new Array(shape.length);
  var x, y, row, outRow;
  for (y = 0; y < shape.length; ++y) {
    row = shape[y];
    out[y] = outRow = new Array(row.length);
    for (x = 0; x < outRow.length; ++x) {
      outRow[x] = {
        id: row[x],
        metadata: null,
      };
    }
  }
  return out;
}

function reformatIngredients(ingredients) {
  var out = new Array(ingredients.length);
  for (var i = 0; i < out.length; ++i) {
    out[i] = {
      id: ingredients[i].id,
      metadata: ingredients[i].metadata,
    };
  }
  return out;
}
