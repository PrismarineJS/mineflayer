mf.Control = {
    NoControl:    0,
    Forward:      1,
    Back:         2,
    Left:         3,
    Right:        4,
    Jump:         5,
    Crouch:       6,
    DiscardItem:  7,
    Action1:      8,
    Action2:      9,
};
    
mf.onChat(function(user, text) {
    if (text == "jump") {
        mf.setControlState(mf.Control.Jump, true);
        mf.setTimeout(function() {
            mf.setControlState(mf.Control.Jump, false);
        }, 200);
    }
});
