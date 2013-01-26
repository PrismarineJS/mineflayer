module.exports = Window;

function Window(id, type, title, slotCount) {
  this.id = id;
  this.type = type;
  this.title = title;
  this.slots = new Array(slotCount);
  // item id -> total count
  this.count = {};
  // in vanilla client, this is the item you are holding with the
  // mouse cursor
  this.selectedItem = null;
}

Window.prototype.findItem = function(itemType, metadata) {
  for (var i = 0; i < this.slots.length; ++i) {
    var item = this.slots[i];
    if (itemType === item.type &&
       (metadata == null || item.metadata === metadata))
    {
      return item;
    }
  }
  return null;
};
