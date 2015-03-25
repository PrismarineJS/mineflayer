var assert = require("assert");
var Item = require("../item");

module.exports = inject;

function inject(bot) {
  bot.creative = {
    setInventorySlot: setInventorySlot,
  };

  function setInventorySlot(slot, item) {
    assert(9 <= slot && slot <= 44);
    bot.client.write("set_creative_slot", {
      slot: slot,
      item: Item.toNotch(item),
    });
  }
}
