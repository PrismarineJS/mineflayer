class AABB {
  constructor (x0, y0, z0, x1, y1, z1) {
    this.minX = x0
    this.minY = y0
    this.minZ = z0
    this.maxX = x1
    this.maxY = y1
    this.maxZ = z1
  }

  clone () {
    return new AABB(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ)
  }

  floor () {
    this.minX = Math.floor(this.minX)
    this.minY = Math.floor(this.minY)
    this.minZ = Math.floor(this.minZ)
    this.maxX = Math.floor(this.maxX)
    this.maxY = Math.floor(this.maxY)
    this.maxZ = Math.floor(this.maxZ)
  }

  extend (dx, dy, dz) {
    if (dx < 0) this.minX += dx
    else this.maxX += dx

    if (dy < 0) this.minY += dy
    else this.maxY += dy

    if (dz < 0) this.minZ += dz
    else this.maxZ += dz

    return this
  }

  contract (x, y, z) {
    this.minX += x
    this.minY += y
    this.minZ += z
    this.maxX -= x
    this.maxY -= y
    this.maxZ -= z
    return this
  }

  expand (x, y, z) {
    this.minX -= x
    this.minY -= y
    this.minZ -= z
    this.maxX += x
    this.maxY += y
    this.maxZ += z
    return this
  }

  offset (x, y, z) {
    this.minX += x
    this.minY += y
    this.minZ += z
    this.maxX += x
    this.maxY += y
    this.maxZ += z
    return this
  }

  computeOffsetX (other, offsetX) {
    if (other.maxY > this.minY && other.minY < this.maxY && other.maxZ > this.minZ && other.minZ < this.maxZ) {
      if (offsetX > 0.0 && other.maxX <= this.minX) {
        offsetX = Math.min(this.minX - other.maxX, offsetX)
      } else if (offsetX < 0.0 && other.minX >= this.maxX) {
        offsetX = Math.max(this.maxX - other.minX, offsetX)
      }
    }
    return offsetX
  }

  computeOffsetY (other, offsetY) {
    if (other.maxX > this.minX && other.minX < this.maxX && other.maxZ > this.minZ && other.minZ < this.maxZ) {
      if (offsetY > 0.0 && other.maxY <= this.minY) {
        offsetY = Math.min(this.minY - other.maxY, offsetY)
      } else if (offsetY < 0.0 && other.minY >= this.maxY) {
        offsetY = Math.max(this.maxY - other.minY, offsetY)
      }
    }
    return offsetY
  }

  computeOffsetZ (other, offsetZ) {
    if (other.maxX > this.minX && other.minX < this.maxX && other.maxY > this.minY && other.minY < this.maxY) {
      if (offsetZ > 0.0 && other.maxZ <= this.minZ) {
        offsetZ = Math.min(this.minZ - other.maxZ, offsetZ)
      } else if (offsetZ < 0.0 && other.minZ >= this.maxZ) {
        offsetZ = Math.max(this.maxZ - other.minZ, offsetZ)
      }
    }
    return offsetZ
  }

  intersects (other) {
    return this.minX < other.maxX && this.maxX > other.minX &&
           this.minY < other.maxY && this.maxY > other.minY &&
           this.minZ < other.maxZ && this.maxZ > other.minZ
  }
}

module.exports = AABB
