var items = require('minecraft-data').items;
var blocks = require('minecraft-data').blocks;
var assert = require('assert');

module.exports = Item;

function Item(type, count, metadata, nbt) {
  if (type == null) return;

  this.type = type;
  this.count = count;
  this.metadata = metadata == null ? 0 : metadata;
  this.nbt = nbt || new Buffer(0);

  var itemEnum = items[type] || blocks[type];
  assert.ok(itemEnum);
  this.name = itemEnum.name;
  this.displayName = itemEnum.displayName;
  this.stackSize = itemEnum.stackSize;
}

Item.equal = function(item1, item2) {
  if (item1 == null && item2 == null) {
    return true;
  } else if (item1 == null) {
    return false;
  } else if (item2 == null) {
    return false;
  } else {
    return item1.type === item2.type &&
      item1.count === item2.count &&
      item1.metadata === item2.metadata;
  }
};

Item.toNotch = function(item) {
  if (item == null) return {blockId: -1};
  var notchItem = {
    blockId: item.type,
    itemCount: item.count,
    itemDamage: item.metadata
  };
  if (item.nbt && item.nbt.length !== 0)
    notchItem.nbtData = item.nbt;
  return notchItem;
};

Item.fromNotch = function(item) {
  if (item.blockId === -1) return null;
  return new Item(item.blockId, item.itemCount, item.itemDamage, item.nbtData);
};
