// ids of ServerboundPlayerActionPacket's action enum (`block_dig` status). 26.3 inserted
// CHANGE_DESTROY_DIRECTION at id 1, shifting every later action up by one.
module.exports = { getPlayerActionIds }

function getPlayerActionIds (bot) {
  const shifted = bot.supportFeature('playerActionHasChangeDestroyDirection')
  return {
    start: 0,
    abort: shifted ? 2 : 1,
    finish: shifted ? 3 : 2,
    releaseUseItem: shifted ? 6 : 5
  }
}
