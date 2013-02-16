var Biome = require('./biome')
  , blocks = require('./enums/blocks')

module.exports = Block;

function Block(type, biomeId) {
  this.type = type;
  this.metadata = 0;
  this.light = 0;
  this.skyLight = 0;
  this.add = 0;
  this.biome = new Biome(biomeId);
  this.position = null;

  var blockEnum = blocks[type];
  if (blockEnum) {
    this.name = blockEnum.name;
    this.hardness = blockEnum.hardness;
    this.displayName = blockEnum.displayName;
    this.boundingBox = blockEnum.boundingBox;
    this.diggable = blockEnum.diggable;
    this.material = blockEnum.material;
    this.harvestTools = blockEnum.harvestTools;
  } else {
    this.name = "";
    this.displayName = "";
    this.hardness = 0;
    this.boundingBox = "empty"
    this.diggable = false;
  }
}

