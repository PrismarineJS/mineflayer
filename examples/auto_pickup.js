
mf.include("chat_commands.js");
mf.include("task_manager.js");
mf.include("items.js");
mf.include("navigator.js");

(function() {
    var auto_pickup = false;
    chat_commands.registerCommand("autopickup", function(speaker_name, args, responder_func) {
        if (args[0] === "on") {
            auto_pickup = true;
            responder_func("auto pickup is now ON");
        } else {
            auto_pickup = false;
            responder_func("auto pickup is now OFF");
        }
    }, 1);

    mf.onEntitySpawned(function(entity) {
        if (!auto_pickup) {
            return;
        }
        if (entity.type !== mf.EntityType.Pickup) {
            return;
        }
        // let it settle first
        mf.setTimeout(function() {
            entity = mf.entity(entity.entity_id);
            if (entity === undefined) {
                return;
            }
            if (entity.position.distanceTo(mf.self().position) > 7) {
                return;
            }
            task_manager.doNow(new task_manager.Task(function start() {
                navigator.navigateTo(entity.position, {
                    "end_radius": 1,
                    "timeout_milliseconds": 0.5 * 1000,
                    "arrived_func": function() {
                        task_manager.done();
                    }, "cant_find_func": function() {
                        task_manager.done();
                    },
                });
            }, function stop() {
                navigator.stop();
            }, "auto pickup some " + items.nameForId(entity.item.type)));
        }, 1000);
    });
})();
