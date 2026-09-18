// https://minecraft.wiki/w/Attribute#Operations
function getAttributeValue (prop) {
  let X = prop.value
  for (const mod of prop.modifiers) {
    if (mod.operation !== 0) continue
    X += mod.amount
  }
  let Y = X
  for (const mod of prop.modifiers) {
    if (mod.operation !== 1) continue
    Y += X * mod.amount
  }
  for (const mod of prop.modifiers) {
    if (mod.operation !== 2) continue
    Y += Y * mod.amount
  }
  return Y
}

// The key an attribute arrives under is not stable across versions or protocol builds - the same
// attribute shows up as `generic.armor`, `minecraft:armor` or `armor`, and the interaction ranges
// as `player.entity_interaction_range` - so match on the last segment, which is.
function findAttribute (entity, name) {
  const attributes = entity && entity.attributes
  if (!attributes) return null
  if (attributes[name]) return attributes[name]
  for (const key of Object.keys(attributes)) {
    if (key.split(/[:.]/).pop() === name) return attributes[key]
  }
  return null
}

function attributeValue (entity, name, fallback) {
  const attribute = findAttribute(entity, name)
  return attribute ? getAttributeValue(attribute) : fallback
}

module.exports = { getAttributeValue, findAttribute, attributeValue }
