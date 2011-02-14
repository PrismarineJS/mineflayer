mf.onChat(function(user, text) {
    if (text == "jump") {
        mf.setControlState(mf.Control.Jump, true);
        mf.setControlState(mf.Control.Jump, false);
    }
});
