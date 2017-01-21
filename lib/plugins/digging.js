var assert = require('assert');

module.exports = inject;

function inject(bot) {
  var swingInterval = null;
  var waitTimeout = null;

  bot.targetDigBlock = null;
  bot.lastDigTime = null;

  function dig(block, cb) {
    if(bot.targetDigBlock) bot.stopDigging();
    cb = cb || noop;
    bot.lookAt(block.position.offset(0.5,0.5,0.5), false, function() {
      bot._client.write('block_dig', {
        status: 0, // start digging
        location: block.position,
        face: 1, // hard coded to always dig from the top
      });
      var waitTime = bot.digTime(block);
      waitTimeout = setTimeout(finishDigging, waitTime);
      bot.targetDigBlock = block;
      bot._client.write('arm_animation', {hand:0});
      swingInterval = setInterval(function() {
        bot._client.write('arm_animation', {hand:0});
      }, 350);
      var eventName = "blockUpdate:" + block.position;
      bot.on(eventName, onBlockUpdate);

      bot.stopDigging = function() {
        bot.removeListener(eventName, onBlockUpdate);
        clearInterval(swingInterval);
        clearTimeout(waitTimeout);
        swingInterval = null;
        waitTimeout = null;
        bot._client.write('block_dig', {
          status: 1, // cancel digging
          location: bot.targetDigBlock.position,
          face: 1, // hard coded to always dig from the top
        });
        var block = bot.targetDigBlock;
        bot.targetDigBlock = null;
        bot.lastDigTime = new Date();
        bot.emit("diggingAborted", block);
        bot.stopDigging = noop;
        cb(new Error("Digging aborted"));
      };

      function onBlockUpdate(oldBlock, newBlock) {
        // vanilla server never actually interrupt digging, but some server send block update when you start digging
        // so ignore block update if not air
        if(newBlock.type !== 0) return;
        bot.removeListener(eventName, onBlockUpdate);
        clearInterval(swingInterval);
        clearTimeout(waitTimeout);
        swingInterval = null;
        waitTimeout = null;
        bot.targetDigBlock = null;
        bot.lastDigTime = new Date();
        bot.emit("diggingCompleted", newBlock);
        cb();
      }

      function finishDigging() {
        clearInterval(swingInterval);
        clearTimeout(waitTimeout);
        swingInterval = null;
        waitTimeout = null;
        bot._client.write('block_dig', {
          status: 2, // finish digging
          location: bot.targetDigBlock.position,
          face: 1, // hard coded to always dig from the top
        });
        bot.targetDigBlock = null;
        bot.lastDigTime = new Date();
        bot._updateBlock(block.position, 0, 0);
      }
    });
  }

  function canDigBlock(block) {
    return block && block.diggable && block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6;
  }

  function digTime(block) {
    return block.digTime(bot.heldItem ? bot.heldItem.type : null,bot.game.gameMode === 'creative',
      bot.blockAt(bot.entity.position).type === 9, !bot.entity.onGround); // only stationary water counts
  }

  bot.dig = dig;
  bot.stopDigging = noop;
  bot.canDigBlock = canDigBlock;
  bot.digTime = digTime;
}

function noop(err) {
  if(err) throw err;
}
