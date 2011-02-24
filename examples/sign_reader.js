mf.include("giver.js");
mf.onSignUpdated(function(location, text) {
    mf.chat("sign at " + location + " says: " + text);
});
