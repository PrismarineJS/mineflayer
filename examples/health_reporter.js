
(function() {
    function healthStatusToString() {
        var health_status = mf.healthStatus();
        // food saturation is always reported as 0 for Minecraft Beta 1.8.1, so don't bother reporting it.
        return "health: " + (health_status.health * 5) + "%; food: " + (health_status.food * 5) + "%";
    }
    chat_commands.registerCommand("health", function(speaker, args, responder_func) {
        responder_func(healthStatusToString());
    });

    var callback_func;
    chat_commands.registerCommand("healthreport", function(speaker, args, responder_func) {
        var just_turned_off = false;
        if (callback_func !== undefined) {
            mf.removeHandler(mf.onHealthStatusChanged, callback_func);
            callback_func = undefined;
            just_turned_off = true;
        }
        if (args[0] === "on") {
            var previous_status = mf.healthStatus();
            callback_func = function() {
                var current_status = mf.healthStatus();
                var messages = [];
                if (current_status.health < previous_status.health) {
                    messages.push("ouch!");
                    if (current_status.food < 18) {
                        messages.push("NOT regenerating!");
                    } else {
                        messages.push("but regenerating.");
                    }
                }
                if (current_status.health < 20) {
                    if (previous_status.food >= 18 && current_status.food < 18) {
                        messages.push("stopped regenerating!");
                    } else if (previous_status.food < 18 && current_status.food >= 18) {
                        messages.push("now regenerating.");
                    }
                }
                if (previous_status.health < 20 && current_status.health === 20) {
                    messages.push("full health.");
                }
                previous_status = current_status;
                if (messages.length === 0) {
                    // not worth spamming uninteresting updates.
                    return;
                }
                messages.push(healthStatusToString());
                responder_func(messages.join(" "));
            };
            mf.onHealthStatusChanged(callback_func);
            responder_func("health report is now ON");
        } else {
            if (just_turned_off) {
                responder_func("health report is now OFF");
            }
        }
    }, 1);
})();
