const math = require('./math');
const euclideanMod = math.euclideanMod;
const PI = Math.PI;
const PI_2 = Math.PI * 2;
const TO_RAD = PI / 180;
const TO_DEG = 1 / TO_RAD;
const FROM_NOTCH_BYTE = 360 / 256;
const FROM_NOTCH_VEL = 5 / 32000;

export {toRadians};
export {toDegrees};
export {fromNotchianYaw};
export {fromNotchianPitch};

export function toNotchianYaw(yaw) {
  return toDegrees(PI - yaw);
}

export function toNotchianPitch(pitch) {
  return toDegrees(-pitch);
}

export function fromNotchianYawByte(yaw) {
  return fromNotchianYaw(yaw * FROM_NOTCH_BYTE);
}

export function fromNotchianPitchByte(pitch) {
  return fromNotchianPitch(pitch * FROM_NOTCH_BYTE);
}

export function fromNotchVelocity(vel) {
  return vel.scaled(FROM_NOTCH_VEL);
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
