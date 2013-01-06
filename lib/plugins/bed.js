module.exports = inject;

var face =  {
  noDirection: -1,
  negativeY: 0,
  positiveY: 1,
  negativeZ: 2,
  positiveZ: 3,
  negativeX: 4,
  positiveX: 5,
};

function inject(bot) {
  bot.client.on(0x46, function(packet) {
    if (packet.reason === 0) {
      // occurs when you can't spawn in your bed and your spawn point gets reset
      bot.emit('spawnReset');
    }
  });

  bot.sleep = function(bedPosition) {
    bot.client.write(0x0f, {
      x: bedPosition.x,
      y: bedPosition.y,
      z: bedPosition.z,
      direction: face.positiveY,
      heldItem: bot.entity.heldItem,
      cursorX: 8,
      cursorY: 8,
      cursorZ: 8,
    });
  };

  bot.wake = function() {
    bot.client.write(0x13, {
      entityId: bot.entity.id,
      actionId: 3,
    });
  };
}
