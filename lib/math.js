export function clamp(min, x, max) {
  return x < min ? min : x > max ? max : x;
}

export function sign(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

export function euclideanMod(numerator, denominator) {
  const result = numerator % denominator;
  return result < 0 ? result + denominator : result;
}
