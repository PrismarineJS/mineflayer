var minecraftData = require("minecraft-data");

// for example:
//   blocksByName.dirt.id
//   itemsByName.swordStone.id
// see also module `minecraft-data`

var blocksByName = {};
var itemsByName = {};

module.exports = {
  blocksByName: blocksByName,
  itemsByName: itemsByName,
};

indexEnums(blocksByName, minecraftData.blocks);
indexEnums(itemsByName, minecraftData.items);

function indexEnums(nameToObject, idToObject) {
  for (var id in idToObject) {
    var object = idToObject[id];
    var existingObject = nameToObject[object.name];
    if (existingObject != null) {
      console.log("");
      console.log("collision:", existingObject, object);
    } else {
      nameToObject[object.name] = object;
    }
  }
}
