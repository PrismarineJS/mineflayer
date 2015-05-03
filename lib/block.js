var Biome = require('./biome');
var blocks = require('minecraft-data').blocks;

module.exports = Block;

function Block(type, biomeId, metadata) {
  this.type = type;
  this.metadata = metadata;
  this.light = 0;
  this.skyLight = 0;
  this.biome = new Biome(biomeId);
  this.position = null;

  var blockEnum = blocks[type];
  if (blockEnum) {
    this.name = blockEnum.name;
    this.hardness = blockEnum.hardness;
    this.displayName = blockEnum.displayName;
    if("variations" in blockEnum)
      for(var i in blockEnum["variations"])
      {
        if(blockEnum["variations"][i].metadata===metadata)
          this.displayName=blockEnum["variations"][i].displayName;
      }
    this.boundingBox = blockEnum.boundingBox;
    this.diggable = blockEnum.diggable;
    this.material = blockEnum.material;
    this.harvestTools = blockEnum.harvestTools;
    this.drops = blockEnum.drops;
  } else {
    this.name = "";
    this.displayName = "";
    this.hardness = 0;
    this.boundingBox = "empty";
    this.diggable = false;
  }
}

