var items = require('../lib/enums/items');

var displayNames = {};
var names = {};
var lastItemId = 0;
for (var key in items) {
  var item = items[key];
  if (item.displayName == null) {
    console.log("Missing displayName:", item.id);
  } else {
    var otherBlock = displayNames[item.displayName];
    if (otherBlock) {
      console.log("Duplicate displayName:", otherBlock.id, "and", item.id,
          "both share", item.displayName);
    } else {
      displayNames[item.displayName] = item;
    }
  }
  if (item.name == null) {
    console.log("Missing name:", item.id);
  } else {
    var otherBlock = names[item.name];
    if (otherBlock) {
      console.log("Duplicate name:", otherBlock.id, "and", item.id,
          "both share", item.name);
    } else {
      names[item.name] = item;
    }
  }
  var delta = item.id - lastItemId;
  if (delta !== 1) {
    console.log("jump from", lastItemId, "to", item.id);
  }
  lastItemId = item.id;
}
