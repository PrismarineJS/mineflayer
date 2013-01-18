module.exports = inject;

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
      direction: 1, // positive Y
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
