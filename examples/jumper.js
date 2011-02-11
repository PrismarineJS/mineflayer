mf.onChat(function(user, text) {
    if (text == "jump") {
        mf.setControlState(mf.Control.Jump, true);
        mf.setTimeout(function() {
            mf.setControlState(mf.Control.Jump, false);
        }, 200);
    }
});
