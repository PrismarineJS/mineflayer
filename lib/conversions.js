var math = require('./math')
  , euclideanMod = math.euclideanMod
  , PI = Math.PI
  , PI_2 = Math.PI * 2
  , TO_RAD = PI / 180
  , TO_DEG = 1 / TO_RAD
  , FROM_NOTCH_BYTE = 360 / 256

exports.toRadians = toRadians;
exports.toDegrees = toDegrees;
exports.fromNotchianYaw = fromNotchianYaw;
exports.fromNotchianPitch = fromNotchianPitch;

exports.toNotchianYaw = function toNotchianYaw(yaw) {
  return toDegrees(PI - yaw);
}

exports.toNotchianPitch = function toNotchianPitch(pitch) {
  return toDegrees(-pitch);
}

exports.fromNotchianYawByte = function fromNotchianYawByte(yaw) {
  return fromNotchianYaw(yaw * FROM_NOTCH_BYTE);
}

exports.fromNotchianPitchByte = function fromNotchianPitchByte(pitch) {
  return fromNotchianPitch(pitch * FROM_NOTCH_BYTE);
}

function toRadians(degrees) {
  return TO_RAD * degrees;
}

function toDegrees(radians) {
  return TO_DEG * radians;
}

function fromNotchianYaw(yaw) {
  return euclideanMod(PI - toRadians(yaw), PI_2);
}

function fromNotchianPitch(pitch) {
  return euclideanMod(toRadians(-pitch) + PI, PI_2) - PI;
}
