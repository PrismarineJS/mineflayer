exports.clamp = function clamp(min, x, max) {
  return x < min ? min : x > max ? max : x;
};

exports.sign = function sign(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
};

exports.euclideanMod = function euclideanMod(numerator, denominator) {
  var result = numerator % denominator;
  return result < 0 ? result + denominator : result;
};
