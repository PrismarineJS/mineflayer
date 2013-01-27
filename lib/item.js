var items = require('./enums/items')
  , blocks = require('./enums/blocks')
  , assert = require('assert')

module.exports = Item;

function Item(type, count, meta, nbt) {
  if (type == null) return null;

  this.type = type;
  this.count = count;
  this.meta = meta;
  this.nbt = nbt || new Buffer(0);

  var itemEnum = items[type] || blocks[type];
  assert.ok(itemEnum);
  this.name = itemEnum.name;
  this.displayName = itemEnum.displayName;
  this.stackSize = itemEnum.stackSize;
}
