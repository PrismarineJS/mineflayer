module.exports = inject

// One sequence counter for dig start/stop, use_item_on and use_item. Sent values
// start at 1; abort, release and drop actions send 0 and must not consume a value.
function inject (bot) {
  const hasSequence = bot.registry.isNewerOrEqualTo('1.19')
  let sequence = 0

  bot._nextSequence = () => {
    if (!hasSequence) return 0
    sequence++
    return sequence
  }
}
