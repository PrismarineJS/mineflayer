var vec3 = require('vec3')
  , Vec3 = vec3.Vec3
  , assert = require('assert')
  , zlib = require('zlib')
  , Block = require('../block')
  , CHUNK_SIZE = new Vec3(16, 16, 16)
  , BLOCKS_PER_CHUNK = CHUNK_SIZE.volume()

module.exports = inject;

function inject(bot) {
  var columns = {};

  function addColumn(args) {
    var columnCorner = new Vec3(args.x * 16, 0, args.z * 16);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    if (! args.bitMap) {
      // stop storing the chunk column
      delete columns[key];
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

    bot.emit("chunk", columnCorner);
  }

  function blockAt(absolutePoint) {
    var flooredPoint = vec3(absolutePoint).floor();
    var blockPoint = flooredPoint.modulus(CHUNK_SIZE);
    var columnCorner = flooredPoint.minus(blockPoint);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    var column = columns[key];
    // null column means chunk not loaded
    if (! column) return null;

    var chunkYIndex = Math.floor(absolutePoint.y / 16);

    var blockIndex =
      blockPoint.x +
      CHUNK_SIZE.x * blockPoint.z +
      CHUNK_SIZE.x * CHUNK_SIZE.z * blockPoint.y;
    var blockType = bite(column.blockType);

    var nibbleIndex = blockIndex * 0.5;
    var lowNibble = blockIndex % 2 === 1;

    var biomeBlockIndex = blockPoint.x + CHUNK_SIZE.x * blockPoint.z;
    var biomeId = column.biome.readUInt8(biomeBlockIndex);

    var block = new Block(blockType, biomeId);
    block.meta = nib(column.metadata);
    block.light = nib(column.light);
    block.skyLight = nib(column.skyLight);
    block.add = nib(column.add);

    return block;

    function bite(array) {
      var buf = array[chunkYIndex];
      return buf ? buf.readUInt8(blockIndex) : 0;
    }

    function nib(array) {
      var buf = array[chunkYIndex];
      return buf ? nibble(buf.readUInt8(nibbleIndex), lowNibble) : 0;
    }
  }

  function updateBlock(point, type, metadata) {
    var blockPoint = point.modulus(CHUNK_SIZE);
    var columnCorner = point.minus(blockPoint);
    var key = columnKeyXZ(columnCorner.x, columnCorner.z);
    var column = columns[key];
    assert.ok(column, "trying to update a block in a column that has not been loaded");
    var blockIndex =
      blockPoint.x +
      CHUNK_SIZE.x * blockPoint.z +
      CHUNK_SIZE.x * CHUNK_SIZE.z * blockPoint.y;
    var nibbleIndex = blockIndex * 0.5;
    var chunkYIndex = Math.floor(point.y / 16);
    var blockTypeBuffer = column.blockType[chunkYIndex];
    // if it's null, it was all air, but now we're inserting a block.
    if (! blockTypeBuffer) {
      blockTypeBuffer = new Buffer(4096);
      blockTypeBuffer.fill(0);
      column.blockType[chunkYIndex] = blockTypeBuffer;
    }
    blockTypeBuffer.writeUInt8(type, blockIndex);
    var metadataBuffer = column.metadata[chunkYIndex];
    if (! metadataBuffer) {
      metadataBuffer = new Buffer(2048);
      metadataBuffer.fill(0);
      column.metadata[chunkYIndex] = metadataBuffer;
    }
    var oldValue = metadataBuffer.readUInt8(nibbleIndex);
    var nibbleValue = (blockIndex % 2 === 0) ? metadata << 4 : metadata;
    metadataBuffer.writeUInt8(nibbleValue | oldValue, nibbleIndex);
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

  bot.client.on(0x36, function(packet) {
    // block action
  });

  bot.client.on(0x37, function(packet) {
    // block break animation
  });

  bot.client.on(0x3c, function(packet) {
    // explosion
  });

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

