module.exports = RecipeItem;

function RecipeItem(id, metadata, count) {
  this.id = id;
  this.metadata = metadata;
  this.count = count;
}

RecipeItem.fromEnum = function(itemFromRecipeEnum) {
  if(itemFromRecipeEnum === null)
    return new RecipeItem(-1, null, 1);
  else switch(typeof itemFromRecipeEnum) {
    case "array":
      return new RecipeItem(itemFromRecipeEnum[0], itemFromRecipeEnum[1], 1);
    case "number":
      return new RecipeItem(itemFromRecipeEnum, null, 1);
    case "object":
      return new RecipeItem(itemFromRecipeEnum.id, itemFromRecipeEnum.metadata == null ? itemFromRecipeEnum.metadata : null, itemFromRecipeEnum.count || 1);
  }
};

RecipeItem.clone = function(recipeItem) {
  return new RecipeItem(recipeItem.id, recipeItem.metadata, recipeItem.count);
};