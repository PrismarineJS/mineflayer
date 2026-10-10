const { Vec3 } = require('vec3')

// Client-side relighting after a block change.
//
// The server sends light with each chunk, but afterwards only sends light updates for
// chunks at the edge of a player's view: the vanilla client recomputes the light of the
// chunks it already has. Without this, bot.world keeps every chunk's light from the
// moment it loaded, so a placed torch never lights anything and a mined-out ceiling
// never lets the sky in.
//
// This is the usual two-pass flood fill, run on both channels around the changed block:
// remove the light that depended on the old value, then propagate from what is left.
// Light drops by max(1, filterLight) per step; sky light at 15 goes straight down
// through fully transparent blocks without dropping. Per-face occlusion (slabs, stairs)
// is not modelled.

const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
const DOWN = 3

function createRelighter (bot) {
  const Block = require('prismarine-block')(bot.registry)
  const emitCache = new Map()
  const filterCache = new Map()

  function emission (stateId) {
    let e = emitCache.get(stateId)
    if (e === undefined) {
      e = bot.registry.blocksByStateId[stateId]?.emitLight ?? 0
      if (e > 0) {
        const block = Block.fromStateId(stateId, 0)
        const props = block.getProperties()
        if (props.lit === false) e = 0
        else if (block.name === 'light' && props.level !== undefined) e = Number(props.level)
      }
      emitCache.set(stateId, e)
    }
    return e
  }

  function opacity (stateId) {
    let f = filterCache.get(stateId)
    if (f === undefined) {
      f = bot.registry.blocksByStateId[stateId]?.filterLight ?? 15
      filterCache.set(stateId, f)
    }
    return f
  }

  const local = new Vec3(0, 0, 0)
  function at (x, y, z) {
    const column = bot.world.getColumn(x >> 4, z >> 4)
    if (!column) return null
    local.set(x & 15, y, z & 15)
    return column
  }

  // Sky light sections above the highest one the server sent carry no data. Vanilla reads
  // such a section as the bottom layer of the next section above that has data, or 15 when
  // there is none; a column without any sky data (the Nether) has no sky light at all.
  const skyColumns = new WeakMap()
  function hasSky (column) {
    if (!column.skyLightSections) return true
    let sky = skyColumns.get(column)
    if (sky === undefined) {
      sky = column.skyLightSections.some(s => s)
      if (sky) skyColumns.set(column, sky)
    }
    return sky
  }

  function skySectionIndex (y) {
    return ((y - bot.game.minY) >> 4) + 1
  }

  function inheritedSky (column, index, x, z) {
    const sections = column.skyLightSections
    for (let i = index + 1; i < sections.length; i++) {
      if (sections[i]) return sections[i].get((z << 4) | x)
    }
    return 15
  }

  function getSky (column, x, y, z) {
    if (!hasSky(column)) return 0
    const sections = column.skyLightSections
    if (sections) {
      const index = skySectionIndex(y)
      if (!sections[index]) return inheritedSky(column, index, x, z)
    }
    return column.getSkyLight(local)
  }

  // Before the first write into a section without data, fill it with the values it
  // inherits, so the cells not written keep reading the same.
  function setSky (column, x, y, z, value) {
    const sections = column.skyLightSections
    if (sections) {
      const index = skySectionIndex(y)
      if (!sections[index]) {
        const baseY = y & ~15
        const p = new Vec3(0, 0, 0)
        for (let lx = 0; lx < 16; lx++) {
          for (let lz = 0; lz < 16; lz++) {
            const v = inheritedSky(column, index, lx, lz)
            if (v === 0) continue
            for (let ly = 0; ly < 16; ly++) column.setSkyLight(p.set(lx, baseY + ly, lz), v)
          }
        }
      }
    }
    column.setSkyLight(local.set(x & 15, y, z & 15), value)
  }

  const channels = {
    block: {
      get: (column, x, y, z) => column.getBlockLight(local),
      set: (column, x, y, z, v) => column.setBlockLight(local, v),
      source: (stateId) => emission(stateId),
      sky: false
    },
    sky: {
      get: getSky,
      set: setSky,
      source: () => 0,
      sky: true
    }
  }

  function relightChannel (ch, px, py, pz) {
    const minY = bot.game.minY
    const maxY = minY + bot.game.height - 1
    const get = (x, y, z) => {
      const column = at(x, y, z)
      return column ? ch.get(column, x, y, z) : -1
    }
    const set = (x, y, z, v) => {
      const column = at(x, y, z)
      if (column) ch.set(column, x, y, z, v)
    }
    const stateAt = (x, y, z) => {
      const column = at(x, y, z)
      return column ? column.getBlockStateId(local) : 0
    }

    const add = []
    const old = get(px, py, pz)
    if (old < 0) return

    // Pass 1: take out everything that was lit through the changed block.
    if (old > 0) {
      const remove = [[px, py, pz, old]]
      set(px, py, pz, 0)
      while (remove.length) {
        const [x, y, z, level] = remove.pop()
        for (let d = 0; d < 6; d++) {
          const nx = x + DIRS[d][0]; const ny = y + DIRS[d][1]; const nz = z + DIRS[d][2]
          if (ny < minY || ny > maxY) continue
          const n = get(nx, ny, nz)
          if (n <= 0) continue
          if (n < level || (ch.sky && d === DOWN && level === 15 && n === 15)) {
            set(nx, ny, nz, 0)
            remove.push([nx, ny, nz, n])
            const e = ch.source(stateAt(nx, ny, nz))
            if (e > 0) { set(nx, ny, nz, e); add.push([nx, ny, nz]) }
          } else {
            add.push([nx, ny, nz])
          }
        }
      }
    }

    // The changed block's own light, and its neighbours, which may now shine into it.
    const e = ch.source(stateAt(px, py, pz))
    if (e > get(px, py, pz)) set(px, py, pz, e)
    add.push([px, py, pz])
    for (const [dx, dy, dz] of DIRS) {
      const y = py + dy
      if (y >= minY && y <= maxY) add.push([px + dx, y, pz + dz])
    }
    // Nothing above the top layer blocks the sky.
    if (ch.sky && py === maxY) {
      const f = opacity(stateAt(px, py, pz))
      const top = f === 0 ? 15 : Math.max(0, 15 - f)
      if (top > get(px, py, pz)) set(px, py, pz, top)
    }

    // Pass 2: spread light outwards.
    while (add.length) {
      const [x, y, z] = add.pop()
      const level = get(x, y, z)
      if (level <= 1) continue
      for (let d = 0; d < 6; d++) {
        const nx = x + DIRS[d][0]; const ny = y + DIRS[d][1]; const nz = z + DIRS[d][2]
        if (ny < minY || ny > maxY) continue
        const n = get(nx, ny, nz)
        if (n < 0) continue
        const f = opacity(stateAt(nx, ny, nz))
        const next = ch.sky && d === DOWN && level === 15 && f === 0 ? 15 : level - Math.max(1, f)
        if (next > n) {
          set(nx, ny, nz, next)
          add.push([nx, ny, nz])
        }
      }
    }
  }

  return function relight (pos) {
    const x = Math.floor(pos.x); const y = Math.floor(pos.y); const z = Math.floor(pos.z)
    if (y < bot.game.minY || y >= bot.game.minY + bot.game.height) return
    relightChannel(channels.block, x, y, z)
    const column = bot.world.getColumn(x >> 4, z >> 4)
    if (column && hasSky(column)) relightChannel(channels.sky, x, y, z)
  }
}

module.exports = { createRelighter }
