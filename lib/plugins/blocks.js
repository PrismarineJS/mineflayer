var vec3 = require('vec3')
  , Vec3 = vec3.Vec3
  , assert = require('assert')
  , zlib = require('zlib')
  , Block = require('../block')
  , Painting = require('../painting')
  , CHUNK_SIZE = new Vec3(16, 16, 16)
  , BLOCKS_PER_CHUNK = CHUNK_SIZE.volume()

module.exports = inject;

var paintingFaceToVec = [
  new Vec3(0, 0, -1),
  new Vec3(-1, 0, 0),
  new Vec3(0, 0, 1),
  new Vec3(1, 0, 0),
];

function inject(bot) {
  var columns = {};
  var signs = {};
  var paintingsByPos = {};
  var paintingsById = {};

  function addPainting(painting) {
    paintingsById[painting.id] = painting;
    paintingsByPos[painting.position] = painting;
  }

  function deletePainting(painting) {
    delete paintingsById[painting.id];
    delete paintingsByPos[painting.position];
  }

  function Location(absoluteVector) {
    this.floored = absoluteVector.floored();
    this.blockPoint = this.floored.modulus(CHUNK_SIZE);
    this.chunkCorner = this.floored.minus(this.blockPoint);
    this.key = columnKeyXZ(this.chunkCorner.x, this.chunkCorner.z);
    this.column = columns[this.key];
    this.blockIndex =
      this.blockPoint.x +
      CHUNK_SIZE.x * this.blockPoint.z +
      CHUNK_SIZE.x * CHUNK_SIZE.z * this.blockPoint.y;
    this.chunkYIndex = Math.floor(absoluteVector.y / 16);
  }

  function addColumn(args) {
    var columnCorner = new Vec3(args.x * 16, 0, args.z * 16);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    if (! args.bitMap) {
      // stop storing the chunk column
      delete columns[key];
      bot.emit("chunkColumnUnload", columnCorner);
      return;
    }
    var column = columns[key];
    if (! column) columns[key] = column = new Column();
    var chunkIncluded = new Array(16);
    var addIncluded = new Array(16);
    var y;
    for (y = 0; y < 16; ++y) {
      chunkIncluded[y] = args.bitMap & (1 << y);
      addIncluded[y] = args.addBitMap & (1 << y);
    }

    var offset = 0;

    // block types
    var size = 4096;
    for (y = 0; y < 16; ++y) {
      column.blockType[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // block metadata
    size = 2048;
    for (y = 0; y < 16; ++y) {
      column.metadata[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // light
    for (y = 0; y < 16; ++y) {
      column.light[y] = chunkIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = chunkIncluded[y] ? offset + size : offset;
    }
    // sky light
    if (args.skyLightSent) {
      for (y = 0; y < 16; ++y) {
        column.skyLight[y] = chunkIncluded[y] ?
          args.data.slice(offset, offset + size) : null;
        offset = chunkIncluded[y] ? offset + size : offset;
      }
    }
    // add
    for (y = 0; y < 16; ++y) {
      column.add[y] = addIncluded[y] ?
        args.data.slice(offset, offset + size) : null;
      offset = addIncluded[y] ? offset + size : offset;
    }
    // biome
    if (args.groundUp) {
      size = 256;
      column.biome = args.data.slice(offset, offset + size);
      offset += size;
    }

    assert.strictEqual(offset, args.data.length);
    bot.emit("chunkColumnLoad", columnCorner);
  }

  function blockAt(absolutePoint) {
    var loc = new Location(absolutePoint);
    // null column means chunk not loaded
    if (! loc.column) return null;

    var blockType = bite(loc, loc.column.blockType);

    var biomeBlockIndex = loc.blockPoint.x + CHUNK_SIZE.x * loc.blockPoint.z;
    var nibbleIndex = loc.blockIndex * 0.5;
    var lowNibble = loc.blockIndex % 2 === 1;

    var biomeId = loc.column.biome.readUInt8(biomeBlockIndex);

    var block = new Block(blockType, biomeId);
    block.meta = nib(loc.column.metadata);
    block.light = nib(loc.column.light);
    block.skyLight = nib(loc.column.skyLight);
    block.add = nib(loc.column.add);
    block.position = loc.floored;
    block.signText = signs[loc.floored];
    block.painting = paintingsByPos[loc.floored];

    // check the block below for being a fence
    if (block.boundingBox !== "block") {
      var below_loc = new Location(absolutePoint.offset(0, -1, 0));
      if (below_loc.column && bite(below_loc, below_loc.column.blockType) === 85) {
        // it's more correct to say that this block is solid because of the fence.
        block.boundingBox = "block";
      }
    }

    return block;

    function bite(loc, array) {
      var buf = array[loc.chunkYIndex];
      return buf ? buf.readUInt8(loc.blockIndex) : 0;
    }

    function nib(array) {
      var buf = array[loc.chunkYIndex];
      return buf ? nibble(buf.readUInt8(nibbleIndex), lowNibble) : 0;
    }
  }

  function emitBlockUpdate(oldBlock, newBlock) {
    bot.emit("blockUpdate", oldBlock, newBlock);
    bot.emit("blockUpdate:" + oldBlock.pos, oldBlock, newBlock);
  }

  function updateBlock(point, type, metadata) {
    var oldBlock = blockAt(point);
    var loc = new Location(point);
    var nibbleIndex = loc.blockIndex * 0.5;
    // sometimes minecraft server sends us block updates before it sends
    // us the column that the block is in. ignore this.
    if (! loc.column) return;
    var blockTypeBuffer = loc.column.blockType[loc.chunkYIndex];
    // if it's null, it was all air, but now we're inserting a block.
    if (! blockTypeBuffer) {
      blockTypeBuffer = new Buffer(4096);
      blockTypeBuffer.fill(0);
      loc.column.blockType[loc.chunkYIndex] = blockTypeBuffer;
    }
    blockTypeBuffer.writeUInt8(type, loc.blockIndex);
    var metadataBuffer = loc.column.metadata[loc.chunkYIndex];
    if (! metadataBuffer) {
      metadataBuffer = new Buffer(2048);
      metadataBuffer.fill(0);
      loc.column.metadata[loc.chunkYIndex] = metadataBuffer;
    }
    var oldValue = metadataBuffer.readUInt8(nibbleIndex);
    var nibbleValue = (loc.blockIndex % 2 === 0) ? metadata << 4 : metadata;
    metadataBuffer.writeUInt8(nibbleValue | oldValue, nibbleIndex);

    delete signs[loc.floored];

    var painting = paintingsByPos[loc.floored];
    if (painting) deletePainting(painting);

    emitBlockUpdate(oldBlock, blockAt(point));
  }

  bot.client.on(0x33, function(packet) {
    zlib.inflate(packet.compressedChunkData, function(err, inflated) {
      if (err) return bot.emit('error', err);

      addColumn({
        x: packet.x,
        z: packet.z,
        bitMap: packet.bitMap,
        addBitMap: packet.addBitMap,
        skyLightSent: true,
        groundUp: packet.groundUp,
        data: inflated,
      });
    });
  });


  bot.client.on(0x38, function(packet) {
    zlib.inflate(packet.data.compressedChunkData, function(err, inflated) {
      if(err) return bot.emit('error', err);

      var offset = 0;
      var meta, i, size;
      for (i = 0; i < packet.data.meta.length; ++i) {
        meta = packet.data.meta[i];
        size = (8192 + (packet.data.skyLightSent ? 2048 : 0)) *
          onesInShort(meta.bitMap) +
          2048 * onesInShort(meta.addBitMap) + 256;
        addColumn({
          x: meta.x,
          z: meta.z,
          bitMap: meta.bitMap,
          addBitMap: meta.addBitMap,
          skyLightSent: packet.data.skyLightSent,
          groundUp: true,
          data: inflated.slice(offset, offset + size),
        });
        offset += size;
      }

      assert.strictEqual(offset, inflated.length);
    });
  });

  bot.client.on(0x34, function(packet) {
    // multi block change
    var i, record, metadata, type, blockX, blockZ, y, pt;
    for (i = 0; i < packet.recordCount; ++i) {
      record = packet.data.readUInt32BE(i * 4);
      metadata = (record & 0x0000000f) >> 0;
      type     = (record & 0x0000fff0) >> 4;
      y        = (record & 0x00ff0000) >> 16;
      blockZ   = (record & 0x0f000000) >> 24;
      blockX   = (record & 0xf0000000) >> 28;

      pt = new Vec3(packet.chunkX + blockX, y, packet.chunkZ + blockZ);
      updateBlock(pt, type, metadata);
    }
  });

  bot.client.on(0x35, function(packet) {
    // block change
    var pt = new Vec3(packet.x, packet.y, packet.z);
    updateBlock(pt, packet.type, packet.metadata);
  });

  bot.client.on(0x3c, function(packet) {
    // explosion
    packet.affectedBlockOffsets.forEach(function(offset) {
      var pt = vec3(offset).offset(packet.x, packet.y, packet.z);
      updateBlock(pt.floor(), 0, 0);
    });
  });

  bot.client.on(0x19, function(packet) {
    var pos = new Vec3(packet.x, packet.y, packet.z);
    var painting = new Painting(packet.entityId,
      pos, packet.name, paintingFaceToVec[packet.direction]);
    addPainting(painting);
  });

  bot.client.on(0x1d, function(packet) {
    // destroy entity
    packet.entityIds.forEach(function(id) {
      var painting = paintingsById[id];
      if (painting) deletePainting(painting);
    });
  });

  bot.client.on(0x82, function(packet) {
    // update sign
    var pos = new Vec3(packet.x, packet.y, packet.z);
    var oldBlock = blockAt(pos);
    var str = packet.text1 + "\n" + packet.text2 + "\n" + packet.text3 + "\n" + packet.text4;
    signs[pos] = str;
    emitBlockUpdate(oldBlock, blockAt(pos));
  });
  bot.updateSign = function(block, text) {
    var lines = text.split("\n");
    if (lines.length > 4) {
      bot.emit("error", new Error("too many lines for sign text"));
      return;
    }
    for (var i = 0; i < lines.length; ++i) {
      if (lines[i].length > 15) {
        bot.emit("error", new Error("signs have max line length 15"));
        return;
      }
    }
    bot.client.write(0x82, {
      x: block.position.x,
      y: block.position.y,
      z: block.position.z,
      text1: lines[0] || "",
      text2: lines[1] || "",
      text3: lines[2] || "",
      text4: lines[3] || "",
    });
  }

  // if we get a respawn packet and the dimension is changed,
  // unload all chunks from memory.
  var dimension;
  bot.client.on(0x01, function(packet) {
    dimension = packet.dimension
  });
  bot.client.on(0x09, function(packet) {
    if (dimension === packet.dimension) return;
    dimension = packet.dimension;
    columns = {};
  });

  bot.blockAt = blockAt;
}

function columnKeyXZ(x, z) {
  return x + ',' + z;
}

function onesInShort(n) {
  n = n & 0xffff;
  var count = 0;
  for (var i = 0; i < 16; ++i) {
    count = ((1 << i) & n) ? count + 1 : count;
  }
  return count;
}

function nibble(wholeByte, low) {
  return low ?
    wholeByte & 0x0f :
    wholeByte >> 4;
}

function Column() {
  this.blockType = new Array(16);
  this.metadata = new Array(16);
  this.light = new Array(16);
  this.skyLight = new Array(16);
  this.add = new Array(16);
  this.biome = null;
}

