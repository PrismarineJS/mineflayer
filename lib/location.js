const Vec3 = require('vec3').Vec3
const CHUNK_SIZE = new Vec3(16, 16, 16)

module.exports = Location

function Location (absoluteVector) {
  this.floored = absoluteVector.floored()
  this.blockPoint = this.floored.modulus(CHUNK_SIZE)
  this.chunkCorner = this.floored.minus(this.blockPoint)
  this.blockIndex =
    this.blockPoint.x +
    CHUNK_SIZE.x * this.blockPoint.z +
    CHUNK_SIZE.x * CHUNK_SIZE.z * this.blockPoint.y
  this.biomeBlockIndex = this.blockPoint.x + CHUNK_SIZE.x * this.blockPoint.z
  this.chunkYIndex = Math.floor(absoluteVector.y / 16)
}
