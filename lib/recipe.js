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
  // returns a list of item type and metadata with the delta how many more or
  // less you will have in your inventory after crafting
  var delta = [];
  if (recipe.inShape) applyShape(recipe.inShape, -1);
  if (recipe.outShape) applyShape(recipe.outShape, 1);
  if (recipe.ingredients) applyIngredients(recipe.ingredients);
  // add the result
  add(recipe.type, recipe.metadata, recipe.count);
  return delta;

  function add(type, metadata, count) {
    metadata = metadata == null ? null : metadata;
    for (var i = 0; i < delta.length; ++i) {
      var d = delta[i];
      if (d.type === type && d.metadata === metadata) {
        d.count += count;
        return;
      }
    }
    delta.push({
      type: type,
      metadata: metadata,
      count: count,
    });
  }

  function applyShape(shape, direction) {
    var x, y, row;
    for (y = 0; y < shape.length; ++y) {
      row = recipe.inShape[y];
      for (x = 0; x < row.length; ++x) {
        if (row[x] != null) add(row[x].id, null, direction);
      }
    }
  }

  function applyIngredients(ingredients) {
    var i, id;
    for (i = 0; i < ingredients.length; ++i) {
      id = ingredients[i].id;
      add(ingredients[i].id, ingredients[i].metadata, -1);
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
      outRow[x] = row[x] ? {
        id: row[x],
        metadata: null,
        count: 1,
      } : null;
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
