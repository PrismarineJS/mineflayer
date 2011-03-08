
(function() {
    chat_commands.registerCommand("health", function(speaker, args, responder_func) {
        responder_func("health is " + mf.health() + "/20");
    });

    var on_health_func;
    chat_commands.registerCommand("healthreport", function(speaker, args, responder_func) {
        var just_turned_off = false;
        if (on_health_func !== undefined) {
            mf.removeHandler(mf.onHealthChanged, on_health_func);
            on_health_func = undefined;
            just_turned_off = true;
        }
        if (args[0] === "on") {
            on_health_func = function() {
                responder_func("health is now " + mf.health() + "/20");
            };
            mf.onHealthChanged(on_health_func);
            responder_func("health report is now ON");
        } else {
            if (just_turned_off) {
                responder_func("health report is now OFF");
            }
        }
    }, 1);
})();
