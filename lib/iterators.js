const Vec3 = require('vec3').Vec3

// 2D spiral iterator, useful to iterate on
// columns that are centered on bot position
class ManathanIterator {
  constructor (x, y, maxDistance) {
    this.maxDistance = maxDistance
    this.startx = x
    this.starty = y
    this.x = 2
    this.y = -1
    this.layer = 1
    this.leg = -1
  }

  next () {
    if (this.leg === -1) {
      // use -1 as the center
      this.leg = 0
      return { x: this.startx, y: this.starty }
    } else if (this.leg === 0) {
      if (this.maxDistance === 1) return null
      this.x--
      this.y++
      if (this.x === 0) this.leg = 1
    } else if (this.leg === 1) {
      this.x--
      this.y--
      if (this.y === 0) this.leg = 2
    } else if (this.leg === 2) {
      this.x++
      this.y--
      if (this.x === 0) this.leg = 3
    } else if (this.leg === 3) {
      this.x++
      this.y++
      if (this.y === 0) {
        this.x++
        this.leg = 0
        this.layer++
        if (this.layer === this.maxDistance) {
          return null
        }
      }
    }
    return new Vec3(this.startx + this.x, 0, this.starty + this.y)
  }
}

class OctahedronIterator {
  constructor (start, maxDistance) {
    this.start = start.floored()
    this.maxDistance = maxDistance
    this.apothem = 1
    this.x = -1
    this.y = -1
    this.z = -1
    this.L = this.apothem
    this.R = this.L + 1
  }

  next () {
    if (this.apothem > this.maxDistance) return null
    this.R -= 1
    if (this.R < 0) {
      this.L -= 1
      if (this.L < 0) {
        this.z += 2
        if (this.z > 1) {
          this.y += 2
          if (this.y > 1) {
            this.x += 2
            if (this.x > 1) {
              this.apothem += 1
              this.x = -1
            }
            this.y = -1
          }
          this.z = -1
        }
        this.L = this.apothem
      }
      this.R = this.L
    }
    const X = this.x * this.R
    const Y = this.y * (this.apothem - this.L)
    const Z = this.z * (this.apothem - (Math.abs(X) + Math.abs(Y)))
    return this.start.offset(X, Y, Z)
  }
}

const BlockFace = {
  UNKNOWN: -999,
  BOTTOM: 0,
  TOP: 1,
  NORTH: 2,
  SOUTH: 3,
  WEST: 4,
  EAST: 5
}

// This iterate along a ray starting at (x,y,z) in (dx,dy,dz) direction
// It steps exactly 1 block at a time, returning the block coordinates
// and the face by which the ray entered the block.
class RaycastIterator {
  constructor (x, y, z, dx, dy, dz, maxDistance) {
    this.block = {
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
      face: BlockFace.UNKNOWN
    }

    this.stepX = Math.sign(dx)
    this.stepY = Math.sign(dy)
    this.stepZ = Math.sign(dz)

    this.tDeltaX = (dx === 0) ? Number.MAX_VALUE : Math.abs(1 / dx)
    this.tDeltaY = (dy === 0) ? Number.MAX_VALUE : Math.abs(1 / dy)
    this.tDeltaZ = (dz === 0) ? Number.MAX_VALUE : Math.abs(1 / dz)

    this.tMaxX = (dx === 0) ? Number.MAX_VALUE : Math.abs((this.block.x + (dx > 0 ? 1 : 0) - x) / dx)
    this.tMaxY = (dy === 0) ? Number.MAX_VALUE : Math.abs((this.block.y + (dy > 0 ? 1 : 0) - y) / dy)
    this.tMaxZ = (dz === 0) ? Number.MAX_VALUE : Math.abs((this.block.z + (dz > 0 ? 1 : 0) - z) / dz)

    this.maxDistance = maxDistance
  }

  next () {
    if (Math.min(Math.min(this.tMaxX, this.tMaxY), this.tMaxZ) > this.maxDistance) { return null }

    if (this.tMaxX < this.tMaxY) {
      if (this.tMaxX < this.tMaxZ) {
        this.block.x += this.stepX
        this.tMaxX += this.tDeltaX
        this.block.face = this.stepX > 0 ? BlockFace.WEST : BlockFace.EAST
      } else {
        this.block.z += this.stepZ
        this.tMaxZ += this.tDeltaZ
        this.block.face = this.stepZ > 0 ? BlockFace.NORTH : BlockFace.SOUTH
      }
    } else {
      if (this.tMaxY < this.tMaxZ) {
        this.block.y += this.stepY
        this.tMaxY += this.tDeltaY
        this.block.face = this.stepY > 0 ? BlockFace.BOTTOM : BlockFace.TOP
      } else {
        this.block.z += this.stepZ
        this.tMaxZ += this.tDeltaZ
        this.block.face = this.stepZ > 0 ? BlockFace.NORTH : BlockFace.SOUTH
      }
    }

    return this.block
  }
}

module.exports = {
  ManathanIterator,
  OctahedronIterator,
  RaycastIterator
}
