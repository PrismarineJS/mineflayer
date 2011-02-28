mf.onChat(function(speaker, message) {
    mf.debug("<" + speaker + "> " + message);
});
mf.onNonSpokenChat(function(message) {
    mf.debug(message);
});
