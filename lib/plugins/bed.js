var assert = require('assert');

module.exports = inject;

function inject(bot) {
  bot.isSleeping = false;

  function wake() {
    assert.strictEqual(bot.isSleeping, true, "already awake");
    bot.client.write('entity_action', {
      entityId: bot.entity.id,
      actionId: 3,
      jumpBoost: 0
    });
  }

  function sleep(bedBlock) {
    assert.strictEqual(bot.isSleeping, false, "already sleeping");
    assert.strictEqual(bedBlock.type, 26);
    bot.activateBlock(bedBlock);
  }

  bot.client.on('game_state_change', function(packet) {
    if (packet.reason === 0) {
      // occurs when you can't spawn in your bed and your spawn point gets reset
      bot.emit('spawnReset');
    }
  });

  bot.on('entitySleep', function(entity) {
    if (entity === bot.entity) {
      bot.isSleeping = true;
      bot.emit('sleep');
    }
  });

  bot.on('entityWake', function(entity) {
    if (entity === bot.entity) {
      bot.isSleeping = false;
      bot.emit('wake');
    }
  });

  bot.wake = wake;
  bot.sleep = sleep;
}
