var math = require('./math');
var euclideanMod = math.euclideanMod;
var PI = Math.PI;
var PI_2 = Math.PI * 2;
var TO_RAD = PI / 180;
var TO_DEG = 1 / TO_RAD;
var FROM_NOTCH_BYTE = 360 / 256;
var FROM_NOTCH_VEL = 5 / 32000;

exports.toRadians = toRadians;
exports.toDegrees = toDegrees;
exports.fromNotchianYaw = fromNotchianYaw;
exports.fromNotchianPitch = fromNotchianPitch;

exports.toNotchianYaw = function(yaw) {
  return toDegrees(PI - yaw);
};

exports.toNotchianPitch = function(pitch) {
  return toDegrees(-pitch);
};

exports.fromNotchianYawByte = function(yaw) {
  return fromNotchianYaw(yaw * FROM_NOTCH_BYTE);
};

exports.fromNotchianPitchByte = function(pitch) {
  return fromNotchianPitch(pitch * FROM_NOTCH_BYTE);
};

exports.fromNotchVelocity = function(vel) {
  return vel.scaled(FROM_NOTCH_VEL);
};

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
