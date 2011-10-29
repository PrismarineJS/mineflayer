
mf.include("player_tracker.js");
mf.include("navigator.js");
mf.include("Set.js");
mf.include("Heap.js");
mf.include("arrays.js");

(function() {
    function defend(speaker, args, responder_func) {
        stop();
        var name = args[0];
        if (name === undefined) {
            name = speaker;
        }
        var entity = player_tracker.findUserEntityUnambiguously(name, speaker, responder_func);
        if (entity === undefined) {
            return;
        }
        responder_func("now defending " + entity.username);
        current_defended_entity_id = entity.entity_id;
        next_bad_guy_interval_id = mf.setInterval(nextBadGuy, 3 * 1000);
        nextBadGuy();
    }
    chat_commands.registerCommand("defend", defend, 0, 1);

    function stop() {
        if (next_bad_guy_interval_id !== undefined) {
            mf.clearInterval(next_bad_guy_interval_id);
            next_bad_guy_interval_id = undefined;
        }
        stopPunching();
    }
    function stopPunching() {
        if (punch_bad_guy_interval_id !== undefined) {
            mf.clearInterval(punch_bad_guy_interval_id);
            punch_bad_guy_interval_id = undefined;
        }
    }
    chat_commands.registerCommand("stop", stop);
    var Peaceful = 0;
    var Neutral = 1;
    var Aggressive = 2;

    var mob_stance = {};
    mob_stance[mf.MobType.Creeper] = Aggressive;
    mob_stance[mf.MobType.Skeleton] = Aggressive;
    mob_stance[mf.MobType.Spider] = Aggressive; //Worst case for spiders
    mob_stance[mf.MobType.GiantZombie] = Aggressive;
    mob_stance[mf.MobType.Zombie] = Aggressive;
    mob_stance[mf.MobType.Slime] = Aggressive;
    mob_stance[mf.MobType.Ghast] = Aggressive;
    mob_stance[mf.MobType.ZombiePigman] = Neutral;
    mob_stance[mf.MobType.Pig] = Peaceful;
    mob_stance[mf.MobType.Sheep] = Peaceful;
    mob_stance[mf.MobType.Cow] = Peaceful;
    mob_stance[mf.MobType.Chicken] = Peaceful;
    mob_stance[mf.MobType.Squid] = Peaceful;
    mob_stance[mf.MobType.Wolf] = Neutral;

    var current_defended_entity_id;
    var next_bad_guy_interval_id;
    var punch_bad_guy_interval_id;
    var entity_id_set = new Set();
    function nextBadGuy() {
        stopPunching();
        var current_defended_entity = mf.entity(current_defended_entity_id);
        if (current_defended_entity === undefined) {
            return;
        }
        var current_defended_entity_position = current_defended_entity.position;
        var entity_id_heap = new Heap(function(entity_id) {
            var entity = mf.entity(entity_id);
            if (entity === undefined) {
                return Infinity;
            }
            return current_defended_entity_position.distanceTo(entity.position);
        });
        for (var entity_id in entity_id_set.values) {
            entity_id_heap.add(parseInt(entity_id));
        }

        var bad_guy;
        while (true) {
            var bad_guy_id = entity_id_heap.take();
            if (bad_guy_id === undefined) {
                // no bad guys exist?
                break;
            }
            bad_guy = mf.entity(bad_guy_id);
            if (bad_guy === undefined) {
                // race conditions
                continue;
            }
            if (bad_guy.mob_type !== undefined) {
                var flag = false;
                for (var key in mf.MobType) {
                    if (mf.MobType[key] === bad_guy.mob_type) {
                        flag = true;
                        break;
                    }
                }
                if (flag && mob_stance[bad_guy.mob_type] !== Aggressive) {
                    bad_guy = undefined;
                    // we love neutral/peaceful mobs.
                    continue;
                }
            }

            var distance = bad_guy.position.distanceTo(current_defended_entity_position);
            if (distance > 20) {
                // not a threat
                bad_guy = undefined;
                // which means no one else is close enough either
                break;
            }
            break;
        }
        if (bad_guy !== undefined) {
            // get him!!
            bad_guy_id = bad_guy.entity_id;
            var arrived = false;
            navigator.navigateTo(bad_guy.position, {
                "timeout_milliseconds": 1 * 1000,
                "end_radius": 2,
                "arrived_func": function() {
                    arrived = true;
                },
            });
            punch_bad_guy_interval_id = mf.setInterval(function() {
                var bad_guy = mf.entity(bad_guy_id);
                if (bad_guy === undefined) {
                    return;
                }
                var distance = bad_guy.position.distanceTo(mf.self().position);
                if (distance < 5) {
                    // punch the guy!
                    mf.lookAt(bad_guy.position);
                    mf.attackEntity(bad_guy_id);
                    // maintain distance of 3
                    mf.clearControlStates();
                    if (arrived) {
                        if (distance > 3) {
                            mf.setControlState(mf.Control.Forward, true);
                        } else {
                            mf.setControlState(mf.Control.Back, true);
                        }
                    }
                }
            }, 0.1 * 1000);
        } else {
            // no bad guys around. follow the defendee.
            navigator.navigateTo(current_defended_entity_position, {
                "timeout_milliseconds": 3 * 1000,
                "end_radius": 5,
                "arrived_func": nextBadGuy,
            });
        }
    }

    mf.onEntitySpawned(function(entity) {
        if (entity.type !== mf.EntityType.Mob) {
            // TODO: be not afraid of sheep
            return;
        }
        entity_id_set.add(entity.entity_id);
    });
    mf.onEntityDespawned(function(entity) {
        entity_id_set.remove(entity.entity_id);
    });
})();
