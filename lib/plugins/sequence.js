module.exports = inject

// Block prediction sequence shared by dig start/stop, use_item_on and use_item
// (vanilla BlockStatePredictionHandler): pre-incremented, so the first value
// sent is 1. Abort / release / drop actions send 0 and do not consume a value.
function inject (bot) {
  const hasSequence = bot.registry.isNewerOrEqualTo('1.19')
  let sequence = 0

  bot._nextSequence = () => {
    if (!hasSequence) return 0
    sequence++
    return sequence
  }
}
