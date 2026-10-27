// The effective value of an entity attribute after its modifiers are applied, in the game's operation order
// (add, then multiply-base, then multiply-total). https://minecraft.wiki/w/Attribute#Operations
// Shared owner so callers do not each reimplement a base-only reading of prop.value.
function getAttributeValue (prop) {
  if (!prop) return 0
  const modifiers = prop.modifiers || []
  let X = prop.value
  for (const mod of modifiers) {
    if (mod.operation !== 0) continue
    X += mod.amount
  }
  let Y = X
  for (const mod of modifiers) {
    if (mod.operation !== 1) continue
    Y += X * mod.amount
  }
  for (const mod of modifiers) {
    if (mod.operation !== 2) continue
    Y += Y * mod.amount
  }
  return Y
}

module.exports = { getAttributeValue }
