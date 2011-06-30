mf.include("strings.js");
(function() {
    mf.onChat(function(speaker, message) {
        mf.debug("<" + speaker + "> " + message);
    });
    mf.onNonSpokenChat(function(message) {
        mf.debug(message);
    });
    // hax to print our own messages
    var old_mf_chat = mf.chat;
    mf.chat = function(message) {
        mf.debug("<" + mf.self().username + "> " + message);
        old_mf_chat(message);
    };
})();
