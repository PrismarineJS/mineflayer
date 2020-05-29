exports.clamp = function clamp (min, x, max) {
  return Math.max(min, Math.min(x, max))
}

exports.euclideanMod = function euclideanMod (numerator, denominator) {
  const result = numerator % denominator
  return result < 0 ? result + denominator : result
}
