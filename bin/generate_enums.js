var fs = require('fs')
  , assert = require('assert')
  , Batch = require('batch')
  , path = require('path')

var burgerJsonPath = process.argv[2];

if (! burgerJsonPath) {
  console.error("Usage: node bin/generate_enums.js burger.json");
  process.exit(1);
}

var outputs = [
  items,
  blocks,
  biomes,
  recipes,
];

fs.readFile(burgerJsonPath, 'utf8', function(err, json) {
  assert.ifError(err);
  var batch = new Batch();
  outputs.forEach(function(output) {
    batch.push(function(cb) {
      output(JSON.parse(json), cb);
    });
  });
  batch.end(function(err, results) {
    assert.ifError(err);
    var batch = new Batch();
    results.forEach(function(result) {
      batch.push(function(cb) {
        var filepath = path.join(__dirname, '..', 'lib', 'enums', result.name + '.json');
        var serialised = JSON.stringify(result.json, null, 2);
        fs.writeFile(filepath, serialised, cb);
      });
    });
    batch.end(function(err) {
      assert.ifError(err);
    });
  });
});

function items(burger, cb) {
  var itemsJson = burger[0].items.item;
  var item;
  var itemEnum = {};
  for (var id in itemsJson) {
    item = itemsJson[id];
    itemEnum[item.id] = {
      id: item.id,
      displayName: item.display_name,
      name: item.name,
      stackSize: item.stack_size,
    };
  }
  cb(null, {
    name: 'items',
    json: itemEnum,
  });
}

function blocks(burger, cb) {
  var blocksJson = burger[0].blocks.block;
  var block;
  var blockEnum = {
    "0": {
      id: 0,
      name: "air",
      displayName: "Air",
      hardness: 0,
    },
  };
  for (var id in blocksJson) {
    block = blocksJson[id];
    blockEnum[block.id] = {
      id: block.id,
      displayName: block.display_name,
      name: block.name,
      hardness: block.hardness,
    };
  }
  cb(null, {
    name: 'blocks',
    json: blockEnum,
  });
}

function biomes(burger, cb) {
  var biomesJson = burger[0].biomes;
  var biome;
  var biomeEnum = {};
  for (var name in biomesJson) {
    biome = biomesJson[name];
    biomeEnum[biome.id] = {
      id: biome.id,
      color: biome.color,
      //height: biome.height,
      name: biome.name,
      rainfall: biome.rainfall,
      temperature: biome.temperature,
    };
  }
  cb(null, {
    name: 'biomes',
    json: biomeEnum,
  });
}

function recipes(burger, cb) {
  var recipesJson = burger[0].recipes;
  var recipeEnum = {};
  var recipeItemList, recipeItem, ingredients;
  for (var makesId in recipesJson) {
    var recipeList = recipesJson[makesId];
    recipeEnum[makesId] = recipeItemList = [];
    var j, shape, shapeLine;
    for (var i = 0; i < recipeList.length; ++i) {
      var recipe = recipeList[i];
      if (recipe.type === 'shape') {
        recipeItemList.push({
          count: recipe.amount,
          metadata: recipe.metadata,
          inShape: shape = [],
        });
        for (j = recipe.shape.length - 1; j >= 0; --j) {
          var line = recipe.shape[j];
          shape.push(shapeLine = []);
          for (var k = 0; k < line.length; ++k) {
            shapeLine.push(line[k] || null);
          }
        }
      } else if (recipe.type === 'shapeless') {
        recipeItemList.push({
          count: recipe.amount,
          metadata: recipe.metadata,
          ingredients: ingredients = [],
        });
        for(j = 0; j < recipe.ingredients.length; ++j) {
          var ingredient = recipe.ingredients[j];
          ingredients.push({
            id: ingredient.id,
          });
        }
      } else {
        throw new Error("unexpected recipe type: " + recipe.type)
      }
    }
  }
  cb(null, {
    name: "recipes",
    json: recipeEnum,
  });
}
