mf.include("giver.js");
mf.onSignUpdated(function(location, text) {
    if (text === undefined) {
        mf.debug("sign at " + location + " destroyed");
    } else {
        mf.debug("sign at " + location + " says: " + text);
    }
});
