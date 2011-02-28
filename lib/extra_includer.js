mf.include("strings.js");
(function() {
    var args = mf.args();
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        var prefix = "--include=";
        if (arg.startsWith(prefix)) {
            var value = arg.substr(prefix.length);
            mf.include(value);
        }
    }
})();
