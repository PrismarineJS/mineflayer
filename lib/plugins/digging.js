var assert = require('assert');

module.exports = inject;

var toolMultiplier = {
  rock: {
    270: 2, // wood pick
    274: 4, // stone pick
    257: 6, // iron pick
    278: 8, // diamond pick
    285: 12, // gold pick
  },
  wood: {
    271: 2, // wood axe
    275: 4, // stone axe
    258: 6, // iron axe
    279: 8, // diamond axe
    286: 12, // gold axe
  },
  plant: {
    271: 2, // wood axe
    275: 4, // stone axe
    258: 6, // iron axe
    279: 8, // diamond axe
    286: 12, // gold axe
    268: 1.5, // wood sword
    272: 1.5, // stone sword
    267: 1.5, // iron sword
    276: 1.5, // diamond sword
    283: 1.5, // gold sword
  },
  melon: {
    268: 1.5, // wood sword
    272: 1.5, // stone sword
    267: 1.5, // iron sword
    276: 1.5, // diamond sword
    283: 1.5, // gold sword
  },
  leaves: {
    359: 6, // shears
    268: 1.5, // wood sword
    272: 1.5, // stone sword
    267: 1.5, // iron sword
    276: 1.5, // diamond sword
    283: 1.5, // gold sword
  },
  dirt: {
    269: 2, // wood shovel
    273: 4, // stone shovel
    256: 6, // iron shovel
    277: 8, // diamond shovel
    284: 12, // gold shovel
  },
  web: {
    359: 15, // shears
    268: 15, // wood sword
    272: 15, // stone sword
    267: 15, // iron sword
    276: 15, // diamond sword
    283: 15, // gold sword
  },
  wool: {
    359: 4.8, // shears
  },
};

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
      if (newBlock.type === 0) {
        stopDigging(null, newBlock);
        return;
      }
      // if you break leaves, notch sends us a block update with metadata
      // changed... what else can we do??
      if (newBlock.metadata !== oldBlock.metadata) {
        bot._updateBlock(newBlock.position, 0, 0);
        return;
      }
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
    return block && block.diggable && block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6;
  }

  function digTime(block) {
    var time = 1000 * block.hardness * 1.5;
    if (block.harvestTools) {
      var penalty = !bot.heldItem || !block.harvestTools[bot.heldItem.type];
      if (penalty) return time * 10 / 3;
    }
    var toolMultiplier = toolMultiplier[block.material];
    if (toolMultiplier) {
      var multiplier = toolMultiplier[bot.heldItem.type];
      if (multiplier) time /= multiplier;
    }
    if (! bot.entity.onGround) time *= 5;
    var blockIn = bot.blockAt(bot.entity.position);
    var inWater = blockIn.type === 8 || blockIn.type === 9;
    if (inWater) time *= 5;
    return time;
  }

  bot.dig = dig;
  bot.canDigBlock = canDigBlock;
  bot.digTime = digTime;
}

function noop(err) {
  if (err) throw err;
}
