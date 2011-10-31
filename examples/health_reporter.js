
(function() {
    function healthStatusToString() {
        var health_status = mf.healthStatus();
        // food saturation is always reported as 0 for Minecraft Beta 1.8.1, so don't bother reporting it.
        return "health: " + (health_status.health * 5) + "%; food: " + (health_status.food * 5) + "%";
    }
    chat_commands.registerCommand("health", function(speaker, args, responder_func) {
        responder_func(healthStatusToString());
    });

    var on_health_func;
    chat_commands.registerCommand("healthreport", function(speaker, args, responder_func) {
        var just_turned_off = false;
        if (on_health_func !== undefined) {
            mf.removeHandler(mf.onHealthStatusChanged, on_health_func);
            on_health_func = undefined;
            just_turned_off = true;
        }
        if (args[0] === "on") {
            on_health_func = function() {
                responder_func(healthStatusToString());
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
