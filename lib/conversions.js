const math = require('./math')
const euclideanMod = math.euclideanMod
const PI = Math.PI
const PI_2 = Math.PI * 2
const TO_RAD = PI / 180
const TO_DEG = 1 / TO_RAD
const FROM_NOTCH_BYTE = 360 / 256
const FROM_NOTCH_VEL = 5 / 32000

exports.toRadians = toRadians
exports.toDegrees = toDegrees
exports.fromNotchianYaw = fromNotchianYaw
exports.fromNotchianPitch = fromNotchianPitch
exports.toNotchianYaw = yaw => toDegrees(PI - yaw)
exports.toNotchianPitch = pitch => toDegrees(-pitch)
exports.fromNotchianYawByte = yaw => fromNotchianYaw(yaw * FROM_NOTCH_BYTE)
exports.fromNotchianPitchByte = pitch => fromNotchianPitch(pitch * FROM_NOTCH_BYTE)
exports.fromNotchVelocity = vel => vel.scaled(FROM_NOTCH_VEL)

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
