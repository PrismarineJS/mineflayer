mf.include("giver.js");
mf.onSignUpdated(function(location, text) {
    mf.debug("sign at " + location + " says: " + text);
});
