var assert = require('assert');

module.exports = inject;

var toolMultipliers = {
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
  var waitTimeout = null;

  bot.targetDigBlock = null;

  function dig(block, cb) {
    assert.equal(bot.targetDigBlock, null);
    cb = cb || noop;
    bot.lookAt(block.position);
    bot.client.write(0x0e, {
      status: 0, // start digging
      x: block.position.x,
      y: block.position.y,
      z: block.position.z,
      face: 1, // hard coded to always dig from the top
    });
    var waitTime = bot.digTime(block);
    waitTimeout = setTimeout(finishDigging, waitTime);
    bot.targetDigBlock = block;
    swingInterval = setInterval(function() {
      bot.client.write(0x12, {
        entityId: bot.entity.id,
        animation: 1,
      });
    }, 350);
    var eventName = "blockUpdate:" + block.position;
    bot.on(eventName, onBlockUpdate);

    bot.stopDigging = function() {
      bot.removeListener(eventName, onBlockUpdate);
      clearInterval(swingInterval);
      clearTimeout(waitTimeout);
      swingInterval = null;
      waitTimeout = null;
      bot.client.write(0x0e, {
        status: 1, // cancel digging
        x: bot.targetDigBlock.position.x,
        y: bot.targetDigBlock.position.y,
        z: bot.targetDigBlock.position.z,
        face: 1, // hard coded to always dig from the top
      });
      var block = bot.targetDigBlock;
      bot.targetDigBlock = null;
      bot.emit("diggingAborted", block);
      bot.stopDigging = stopDiggingThrower;
    };

    function onBlockUpdate(oldBlock, newBlock) {
      bot.removeListener(eventName, onBlockUpdate);
      clearInterval(swingInterval);
      clearTimeout(waitTimeout);
      swingInterval = null;
      waitTimeout = null;
      bot.targetDigBlock = null;
      if (newBlock.type === 0) {
        bot.emit("diggingCompleted", newBlock);
        cb();
      } else {
        bot.emit("diggingAborted", newBlock);
        cb(new Error("interruption"));
      }
    }

    function finishDigging() {
      clearInterval(swingInterval);
      clearTimeout(waitTimeout);
      swingInterval = null;
      waitTimeout = null;
      bot.client.write(0x0e, {
        status: 2, // finish digging
        x: bot.targetDigBlock.position.x,
        y: bot.targetDigBlock.position.y,
        z: bot.targetDigBlock.position.z,
        face: 1, // hard coded to always dig from the top
      });
      bot.targetDigBlock = null;
      bot._updateBlock(block.position, 0, 0);
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
    var toolMultiplier = toolMultipliers[block.material];
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
  bot.stopDigging = stopDiggingThrower;
  bot.canDigBlock = canDigBlock;
  bot.digTime = digTime;
}

function noop(err) {
  if (err) throw err;
}

function stopDiggingThrower() {
  assert.ok(false, "Not digging");
}
