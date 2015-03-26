var assert = require("assert");
var Vec3 = require('vec3').Vec3;
var Item = require("../item");

module.exports = inject;

function inject(bot) {
  // these features only work when you are in creative mode.
  bot.creative = {
    setInventorySlot: setInventorySlot,
    flyTo: flyTo,
    stopFlying: stopFlying,
  };

  function setInventorySlot(slot, item) {
    assert(0 <= slot && slot <= 44);
    bot.client.write("set_creative_slot", {
      slot: slot,
      item: Item.toNotch(item),
    });
  }

  var normalGravity = null;

  // straight line, so make sure there's a clear path.
  function flyTo(newPosition, cb) {
    // TODO: actually move in steps
    // TODO: send 0x13 i guess.
    normalGravity = bot.physics.gravity;
    bot.physics.gravity = 0;
    bot.entity.position = newPosition;
    bot.entity.velocity = new Vec3(0, 0, 0);
    bot.once("move", cb);
  }

  function stopFlying() {
    bot.physics.gravity = normalGravity;
  }
}
