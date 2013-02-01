var assert = require('assert');

module.exports = inject;

function inject(bot) {
  var swingInterval = null;

  bot.targetDigBlock = null;

  function dig(block, timeout, cb) {
    assert.equal(bot.targetDigBlock, null);
    if (typeof timeout === 'function') {
      cb = timeout;
      timeout = null;
    }
    cb = cb || noop;
    timeout = timeout == null ? 5000 : parseInt(timeout, 10);
    bot.lookAt(block.position);
    bot.client.write(0x0e, {
      status: 0, // start digging
      x: block.position.x,
      y: block.position.y,
      z: block.position.z,
      face: 1, // hard coded to always dig from the top
    });
    bot.client.write(0x0e, {
      status: 2, // finish digging
      x: block.position.x,
      y: block.position.y,
      z: block.position.z,
      face: 1, // hard coded to always dig from the top
    });
    bot.targetDigBlock = block;
    clearInterval(swingInterval);
    swingInterval = setInterval(function() {
      bot.client.write(0x12, {
        entityId: bot.entity.id,
        animation: 1,
      });
    }, 350);
    var eventName = "blockUpdate:" + block.position;
    bot.on(eventName, onBlockUpdate);
    var startDiggingTimeout = setTimeout(function() {
      stopDigging(new Error("digging timed out"));
    }, timeout);

    function onBlockUpdate(oldBlock, newBlock) {
      if (newBlock.type === 0) stopDigging(null, newBlock);
    }

    function stopDigging(error, newBlock) {
      clearInterval(swingInterval);
      clearTimeout(startDiggingTimeout);
      bot.targetDigBlock = null;
      bot.removeListener(eventName, onBlockUpdate);
      if (error) {
        bot.emit("diggingAborted", block);
      } else {
        bot.emit("diggingCompleted", newBlock);
      }
      cb(error);
    }
  }

  function canDigBlock(block) {
    return block.diggable && block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6;
  }

  bot.dig = dig;
  bot.canDigBlock = canDigBlock;
}

function noop(err) {
  if (err) throw err;
}
