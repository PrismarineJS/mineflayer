
var callback_id;
mf.onTimeUpdated(function(seconds) {
    mf.debug("time updated");
    if (callback_id !== undefined) {
        mf.clearInterval(callback_id);
    }
    mf.debug("time: " + mf.timeOfDay());
    callback_id = mf.setInterval(function() {
        mf.debug("time: " + mf.timeOfDay());
    }, 100);
});
