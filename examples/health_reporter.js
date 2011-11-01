mf.include("Set.js");

(function() {
    function backwards(object) {
        // TODO: code dupcliation
        var result = {};
        for (var name in object) {
            result[object[name]] = name;
        }
        return result;
    }
    // TODO: make this easier for everyone to do:
    var effect_to_name = backwards(mf.StatusEffectType);
    function healthStatusToString() {
        var health_status = mf.healthStatus();
        // food saturation is always reported as 0 for Minecraft Beta 1.8.1, so don't bother reporting it.
        return "health: " + (health_status.health * 5) + "%; food: " + (health_status.food * 5) + "%";
    }
    function effectToString(effect) {
        var effect_name = effect_to_name[effect.effect_id];
        var time_left_milliseconds = effect.start_timestamp + effect.duration_milliseconds - mf.currentTimestamp();
        return effect_name + ":" + (time_left_milliseconds / 1000).toFixed(0) + "s";
    }
    function maybeReprotStatus(responder_func) {
        var current_effects = mf.self().effects;
        var status_messages = [];
        for (var effect_id_str in current_effects) {
            var effect = current_effects[effect_id_str];
            status_messages.push(effectToString(effect));
        }
        if (status_messages.length !== 0) {
            responder_func(status_messages.join(" "));
        }
    }
    function isRegenerating(health_status, effects) {
        return health_status.food >= 18 || effects[mf.StatusEffectType.Regeneration] !== undefined;
    }
    chat_commands.registerCommand("health", function(speaker, args, responder_func) {
        responder_func(healthStatusToString());
        maybeReprotStatus(responder_func);
    });

    function keySet(object) {
        var result = new Set();
        for (var key in object) {
            result.add(key);
        }
        return result;
    }
    var callback_func;
    chat_commands.registerCommand("healthreport", function(speaker, args, responder_func) {
        var just_turned_off = false;
        if (callback_func !== undefined) {
            mf.removeHandler(mf.onHealthStatusChanged, callback_func);
            mf.removeHandler(mf.onEntityEffect, callback_func);
            mf.removeHandler(mf.onRemoveEntityEffect, callback_func);
            callback_func = undefined;
            just_turned_off = true;
        }
        if (args[0] === "on") {
            var previous_status = mf.healthStatus();
            var previous_effects = mf.self().effects;
            callback_func = function() {
                var current_status = mf.healthStatus();
                var current_effects = mf.self().effects;
                var previously_regenerating = isRegenerating(previous_status, previous_effects);
                var currently_regenerating = isRegenerating(current_status, current_effects);
                var messages = [];
                if (current_status.health < previous_status.health) {
                    messages.push("ouch!");
                    if (currently_regenerating) {
                        // suppress "but i'm regenerating" message?
                    } else {
                        messages.push("NOT regenerating!");
                    }
                }
                if (current_status.health < 20) {
                    if (previously_regenerating && !currently_regenerating) {
                        messages.push("stopped regenerating!");
                    } else if (!previously_regenerating && currently_regenerating) {
                        messages.push("now regenerating.");
                    }
                }
                if (previous_status.health < 20 && current_status.health === 20) {
                    messages.push("full health.");
                }
                var new_effect_id_set = keySet(current_effects).minus(keySet(previous_effects));
                for (var new_effect_id_str in new_effect_id_set.values) {
                    messages.push("+" + effectToString(current_effects[new_effect_id_str]));
                }
                var gone_effect_id_set = keySet(previous_effects).minus(keySet(current_effects));
                for (var gone_effect_id_str in gone_effect_id_set.values) {
                    messages.push("-" + effectToString(previous_effects[gone_effect_id_str]));
                }
                previous_status = current_status;
                previous_effects = current_effects;
                if (messages.length === 0) {
                    // not worth spamming uninteresting updates.
                    return;
                }
                messages.push(healthStatusToString());
                responder_func(messages.join(" "));
                maybeReprotStatus(responder_func);
            };
            mf.onHealthStatusChanged(callback_func);
            mf.onEntityEffect(callback_func);
            mf.onRemoveEntityEffect(callback_func);
            responder_func("health report is now ON");
        } else {
            if (just_turned_off) {
                responder_func("health report is now OFF");
            }
        }
    }, 1);
})();
