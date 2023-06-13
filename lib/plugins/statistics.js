const { once } = require('events')
module.exports = inject

const customMappings = {
  0: 'minecraft.leave_game',
  1: 'minecraft.play_one_minute',
  2: 'minecraft.time_since_death',
  3: 'minecraft.time_since_rest',
  4: 'minecraft.sneak_time',
  5: 'minecraft.walk_one_cm',
  6: 'minecraft.crouch_one_cm',
  7: 'minecraft.sprint_one_cm',
  8: 'minecraft.walk_on_water_one_cm',
  9: 'minecraft.fall_one_cm',
  10: 'minecraft.climb_one_cm',
  11: 'minecraft.fly_one_cm',
  12: 'minecraft.walk_under_water_one_cm',
  13: 'minecraft.minecart_one_cm',
  14: 'minecraft.boat_one_cm',
  15: 'minecraft.pig_one_cm',
  16: 'minecraft.horse_one_cm',
  17: 'minecraft.aviate_one_cm',
  18: 'minecraft.swim_one_cm',
  19: 'minecraft.strider_one_cm',
  20: 'minecraft.jump',
  21: 'minecraft.drop',
  22: 'minecraft.damage_dealt',
  23: 'minecraft.damage_dealt_absorbed',
  24: 'minecraft.damage_dealt_resisted',
  25: 'minecraft.damage_taken',
  26: 'minecraft.damage_blocked_by_shield',
  27: 'minecraft.damage_absorbed',
  28: 'minecraft.damage_resisted',
  29: 'minecraft.deaths',
  30: 'minecraft.mob_kills',
  31: 'minecraft.animals_bred',
  32: 'minecraft.player_kills',
  33: 'minecraft.fish_caught',
  34: 'minecraft.talked_to_villager',
  35: 'minecraft.traded_with_villager',
  36: 'minecraft.eat_cake_slice',
  37: 'minecraft.fill_cauldron',
  38: 'minecraft.use_cauldron',
  39: 'minecraft.clean_armor',
  40: 'minecraft.clean_banner',
  41: 'minecraft.clean_shulker_box',
  42: 'minecraft.interact_with_brewingstand',
  43: 'minecraft.interact_with_beacon',
  44: 'minecraft.inspect_dropper',
  45: 'minecraft.inspect_hopper',
  46: 'minecraft.inspect_dispenser',
  47: 'minecraft.play_noteblock',
  48: 'minecraft.tune_noteblock',
  49: 'minecraft.pot_flower',
  50: 'minecraft.trigger_trapped_chest',
  51: 'minecraft.open_enderchest',
  52: 'minecraft.enchant_item',
  53: 'minecraft.play_record',
  54: 'minecraft.interact_with_furnace',
  55: 'minecraft.interact_with_crafting_table',
  56: 'minecraft.open_chest',
  57: 'minecraft.sleep_in_bed',
  58: 'minecraft.open_shulker_box',
  59: 'minecraft.open_barrel',
  60: 'minecraft.interact_with_blast_furnace',
  61: 'minecraft.interact_with_smoker',
  62: 'minecraft.interact_with_lectern',
  63: 'minecraft.interact_with_campfire',
  64: 'minecraft.interact_with_cartography_table',
  65: 'minecraft.interact_with_loom',
  66: 'minecraft.interact_with_stonecutter',
  67: 'minecraft.bell_ring',
  68: 'minecraft.raid_trigger',
  69: 'minecraft.raid_win',
  70: 'minecraft.interact_with_anvil',
  71: 'minecraft.interact_with_grindstone',
  72: 'minecraft.target_hit',
  73: 'minecraft.interact_with_smithing_table'
}

const categoryMappings = {
  0: 'minecraft.mined',
  1: 'minecraft.crafted',
  2: 'minecraft.used',
  3: 'minecraft.broken',
  4: 'minecraft.picked_up',
  5: 'minecraft.dropped',
  6: 'minecraft.killed',
  7: 'minecraft.killed_by',
  8: 'minecraft.custom'
}

// Conversion of 1.13 ID -> 1.16 ID
const mappings_1_13 = {
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 18,
  8: 9,
  9: 10,
  10: 11,
  11: 12,  // Figure out if this mapping is correct? minecraft.dive_one_cm -> minecraft.walk_under_water_one_cm
  12: 13,
  13: 14,
  14: 15,
  15: 16,
  16: 17,
  17: 20,
  18: 21,
  19: 22,
  20: 25,
  21: 29,
  22: 30,
  23: 31,
  24: 32,
  25: 33,
  26: 34,
  27: 35,
  28: 36,
  29: 37,
  30: 38,
  31: 39,
  32: 40,
  33: 42,
  34: 43,
  35: 44,
  36: 45,
  37: 46,
  38: 47,
  39: 48,
  40: 49,
  41: 50,
  42: 51,
  43: 52,
  44: 53,
  45: 54,
  46: 55,
  47: 56,
  48: 57,
  49: 58
}

// 1.8 Mappings -> 1.20 Mappings
const mappings_1_8 = {
  'leaveGame': 0,
  'playOneMinute': 1,
  'timeSinceDeath': 2,
  'sneakTime': 4,
  'walkOneCm': 5,
  'crouchOneCm': 6,
  'sprintOneCm': 7,
  'fallOneCm': 9,
  'climbOneCm': 10,
  'flyOneCm': 11,
  'diveOneCm': 'minecraft.dive_one_cm',
  'minecartOneCm': 13,
  'boatOneCm': 14,
  'pigOneCm': 15,
  'horseOneCm': 16,
  'aviateOneCm': 17,
  'swimOneCm': 18,
  'jump': 20,
  'drop': 21,
  'damageDealt': 22,
  'damageTaken': 25,
  'deaths': 29,
  'mobKills': 30,
  'animalsBred': 31,
  'playerKills': 32,
  'fishCaught': 33,
  'talkedToVillager': 34,
  'tradedWithVillager': 35,
  'cakeSlicesEaten': 36,
  'cauldronFilled': 37,
  'cauldronUsed': 38,
  'armorCleaned': 39,
  'bannerCleaned': 40,
  'brewingstandInteraction': 42,
  'beaconInteraction': 43,
  'dropperInspected': 44,
  'hopperInspected': 45,
  'dispenserInspected': 46,
  'noteblockPlayed': 47,
  'noteblockTuned': 48,
  'flowerPotted': 49,
  'trappedChestTriggered': 50,
  'enderchestOpened': 51,
  'itemEnchanted': 52,
  'recordPlayed': 53,
  'furnaceInteraction': 54,
  'craftingTableInteraction': 55,
  'openChest': 56,
  'chestOpened': 57,
  'shulkerBoxOpened': 58,
}

const categoryMapping_1_8 = {
  'mineBlock': 0,
  'craftItem': 1,
  'useItem': 2,
  'breakItem': 3,
  'pickup': 4,
  'drop': 5,
  'killEntity': 6,
  'entityKilledBy': 7,
}

function inject (bot) {
  async function requestStatistics () {
    bot._client.write('client_command', { actionId: 1 })
    const packet = await once(bot._client, 'statistics')
    return parseStatisticsPacket(packet)
  }

  // Major Versions:
  // 1.8 - 1.12
  // 1.13 - 1.15
  // 1.16 - 1.20

  // For Future Proofing + Ease of Reading
  const translate = ({ categoryId, statisticId }) => {
    switch (categoryId) {
      case 0:
        return `${categoryMappings[categoryId]}.minecraft.${bot.registry.blocks[statisticId].name}`
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return `${categoryMappings[categoryId]}.minecraft.${bot.registry.items[statisticId].name}`
      case 6:
      case 7:
        return `${categoryMappings[categoryId]}.minecraft.${bot.registry.entities[statisticId].name}`
      case 8:
      default:
        return customMappings[statisticId]
    }
  }

  const translate_1_16 = ({ categoryId, statisticId }) => {
    return translate({ categoryId, statisticId })
  }

  const translate_1_13 = ({ categoryId, statisticId }) => {
    if (categoryId === 8) {
      return translate({ categoryId, statisticId: mappings_1_13[statisticId] })
    } else {
      return translate({ categoryId, statisticId })
    }
  }

  // Converts name -> categoryId, statisticId
  const translate_1_8 = (name) => {
    const [type, category, other, item] = name.split('.')
    const categoryId = categoryMapping_1_8[category]

    // TODO - figure this part out
    if (type === 'achievement') {
      return name
    }

    switch (categoryId) {
      case 0:
        return translate({ categoryId, statisticId: bot.registry.blocksByName[item].id })
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return translate({ categoryId, statisticId: bot.registry.itemsByName[item].id })
      case 6:
      case 7:
        return translate({ categoryId, statisticId: bot.registry.entitiesByName[item].id })
      case 8:
      default:
        return translate({ categoryId: 8, statisticId: mappings_1_8[category] })
    }
  }

  function parseStatisticsPacket (packet) {
    const [{ entries: packetData }] = packet
    const statistics = {}

    if (bot.supportFeature('statsVersionOne')) {
      for (const val of packetData) {
        statistics[translate_1_8(val.name)] = val.value
      }
    } else if (bot.supportFeature('statsVersionTwo')) {
      for (const val of packetData) {
        statistics[translate_1_13(val)] = val.value
      }
    } else if (bot.supportFeature('statsVersionThree')) {
      for (const val of packetData) {
        statistics[translate_1_16(val)] = val.value
      }
    }

    return statistics
  }

  bot.requestStatistics = requestStatistics
}
