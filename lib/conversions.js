const Vec3 = require('vec3').Vec3
const math = require('./math')
const euclideanMod = math.euclideanMod
const PI = Math.PI
const PI_2 = Math.PI * 2
const TO_RAD = PI / 180
const TO_DEG = 1 / TO_RAD
const FROM_NOTCH_BYTE = 360 / 256
const FROM_NOTCH_VEL_VERTICAL = 1 / 512 * 1.5
const FROM_NOTCH_VEL_HORIZONTAL = 1 / 256

exports.toRadians = toRadians
exports.toDegrees = toDegrees
exports.fromNotchianYaw = fromNotchianYaw
exports.fromNotchianPitch = fromNotchianPitch
exports.fromNotchVelocity = fromNotchVelocity
exports.toNotchianYaw = yaw => toDegrees(PI - yaw)
exports.toNotchianPitch = pitch => toDegrees(-pitch)
exports.fromNotchianYawByte = yaw => fromNotchianYaw(yaw * FROM_NOTCH_BYTE)
exports.fromNotchianPitchByte = pitch => fromNotchianPitch(pitch * FROM_NOTCH_BYTE)

function toRadians (degrees) {
  return TO_RAD * degrees
}

function toDegrees (radians) {
  return TO_DEG * radians
}

function fromNotchianYaw (yaw) {
  return euclideanMod(PI - toRadians(yaw), PI_2)
}

function fromNotchianPitch (pitch) {
  return euclideanMod(toRadians(-pitch) + PI, PI_2) - PI
}

function fromNotchVelocity (vel) {
  return new Vec3(vel.x * FROM_NOTCH_VEL_HORIZONTAL, vel.y * FROM_NOTCH_VEL_VERTICAL, vel.z * FROM_NOTCH_VEL_HORIZONTAL)
}
