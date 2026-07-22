const minecraftData = require('minecraft-data')

const ATTRIBUTES_1_21_4 = [
  'generic.armor',
  'generic.armor_toughness',
  'generic.attack_damage',
  'generic.attack_knockback',
  'generic.attack_speed',
  'player.block_break_speed',
  'player.block_interaction_range',
  'generic.burning_time',
  'generic.explosion_knockback_resistance',
  'player.entity_interaction_range',
  'generic.fall_damage_multiplier',
  'generic.flying_speed',
  'generic.follow_range',
  'generic.gravity',
  'generic.jump_strength',
  'generic.knockback_resistance',
  'generic.luck',
  'generic.max_absorption',
  'generic.max_health',
  'player.mining_efficiency',
  'generic.movement_efficiency',
  'generic.movement_speed',
  'generic.oxygen_bonus',
  'generic.safe_fall_distance',
  'generic.scale',
  'player.sneaking_speed',
  'zombie.spawn_reinforcements',
  'generic.step_height',
  'player.submerged_mining_speed',
  'player.sweeping_damage_ratio',
  'generic.tempt_range',
  'generic.water_movement_efficiency'
]

module.exports = function patchProtocols () {
  const protocol = minecraftData('1.21.4').protocol
  const packet = protocol.play.toClient.types.packet_entity_update_attributes
  const mappings = findMappings(packet)
  if (!mappings) throw new Error('Unable to patch 1.21.4 entity attribute protocol')

  for (const key of Object.keys(mappings)) delete mappings[key]
  for (const [id, attribute] of ATTRIBUTES_1_21_4.entries()) mappings[id] = attribute
}

function findMappings (value) {
  if (Array.isArray(value)) {
    if (value[0] === 'mapper' && value[1]?.mappings) return value[1].mappings
    for (const child of value) {
      const mappings = findMappings(child)
      if (mappings) return mappings
    }
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) {
      const mappings = findMappings(child)
      if (mappings) return mappings
    }
  }
}
