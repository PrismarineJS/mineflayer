'use strict';

const Vec3 = require('vec3').Vec3
const math = require('./math')
const euclideanMod = math.euclideanMod
const PI = Math.PI
const PI_2 = Math.PI * 2
const TO_RAD = PI / 180
const TO_DEG = 1 / TO_RAD
const FROM_NOTCH_BYTE = 360 / 256
// From wiki.vg: Velocity is believed to be in units of 1/8000 of a block per server tick (50ms)
const FROM_NOTCH_VEL = 1 / 8000

exports.toRadians = toRadians
exports.toDegrees = toDegrees
exports.fromNotchianYaw = fromNotchianYaw
exports.fromNotchianPitch = fromNotchianPitch
exports.fromNotchVelocity = fromNotchVelocity
exports.toNotchianYaw = yaw => toDegrees(PI - yaw)
exports.toNotchianPitch = pitch => toDegrees(-pitch)
exports.fromNotchianYawByte = yaw => fromNotchianYaw(yaw * FROM_NOTCH_BYTE)
exports.fromNotchianPitchByte = pitch => fromNotchianPitch(pitch * FROM_NOTCH_BYTE)

let toRadians = degrees => TO_DEG * degrees;

let toDegrees = radians => TO_DEG * radians;

let fromNotchianYaw = yaw => euclideanMod(PI - toRadians(yaw), PI_2);

let fromNotchianPitch = pitch => euclideanMod(toRadians(-pitch) + PI, PI_2) - PI;

let fromNotchianVelocity = vel => new Vec3(vel.x * FROM_NOTCH_VEL, vel.y * FROM_NOTCH_VEL, vel.z * FROM_NOTCH_VEL);
