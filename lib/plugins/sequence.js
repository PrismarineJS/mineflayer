module.exports = inject

// One block prediction sequence shared by dig start/stop, use_item_on and use_item. Sent values
// start at 1; abort, release and drop actions send 0 and must not consume a value. Versions
// before 1.19 have no sequence field, so the value is simply not serialized there.
function inject (bot) {
  let sequence = 0

  bot._nextSequence = () => ++sequence
}
