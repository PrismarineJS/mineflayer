
mf.include("chat_commands.js");
mf.include("items.js");
mf.include("player_tracker.js");
mf.include("inventory.js");
mf.include("navigator.js");
mf.include("Set.js");

(function() {
    var current_instructor_id;
    var current_block;
    var current_responder_func;
    var current_start;
    var current_end;
    chat_commands.registerCommand("fill", function(speaker, args, responder_func) {
        chat_commands.talkToSelf("stop");
        var block = items.findBlockTypeUnambiguously(args[0], responder_func);
        var speaker_entity = player_tracker.entityForPlayer(speaker);
        if (speaker_entity === undefined) {
            responder_func("sorry, can't see you");
            return;
        }
        if (block === undefined) {
            return;
        }
        current_instructor_id = speaker_entity.entity_id;
        current_block = block;
        current_responder_func = responder_func;
        responder_func("punch the start block");
    }, 1);
    mf.onAnimation(function(entity, animation_type) {
        if (entity.entity_id !== current_instructor_id) {
            return;
        }
        if (animation_type !== mf.AnimationType.SwingArm) {
            return;
        }

        var target_block_position;
        var cursor = entity.position.offset(0, 0, entity.height);
        var yaw = entity.yaw, pitch = entity.pitch;
        var vector_length = 0.25;
        var x = Math.cos(yaw) * Math.cos(pitch);
        var y = Math.sin(yaw) * Math.cos(pitch);
        var z = Math.sin(pitch);
        var step_delta = new mf.Point(x * vector_length, y * vector_length, z * vector_length);
        for (var i = 0; i < 40; i++) {
            cursor = cursor.plus(step_delta);
            if (mf.isPhysical(mf.blockAt(cursor).type)) {
                target_block_position = cursor.floored();
                break;
            }
        }
        if (target_block_position === undefined) {
            current_responder_func("you didn't punch anything physical");
            return;
        }

        if (current_start === undefined) {
            // now we know the start
            current_start = target_block_position;
            current_responder_func("now punch the opposite corner");
            return;
        }
        // now we know the end
        current_end = target_block_position;
        // make the start be the min and the end be the max
        function swap(property_name) {
            var tmp = current_start[property_name];
            current_start[property_name] = current_end[property_name];
            current_end[property_name] = tmp;
        }
        if (current_start.x > current_end.x) {
            swap("x");
        }
        if (current_start.y > current_end.y) {
            swap("y");
        }
        if (current_start.z > current_end.z) {
            swap("z");
        }
        // include both ends
        current_end = current_end.offset(1, 1, 1);
        var volume = current_end.minus(current_start);
        current_responder_func("will fill a volume of " + volume.x + "x" + volume.y + "x" + volume.z + " = " + (volume.x * volume.y * volume.z) + " with " + current_block.name);
        current_instructor_id = undefined; // don't need any more instructions

        // how much space do we need to fill
        var estimate_of_need = 0;
        for (x = current_start.x; x < current_end.x; x++) {
            for (y = current_start.y; y < current_end.y; y++) {
                for (z = current_start.z; z < current_end.z; z++) {
                    if (mf.blockAt(new mf.Point(x, y, z)).type === mf.ItemType.Air) {
                        estimate_of_need++;
                    }
                }
            }
        }
        var supply = inventory.itemCount(current_block.id);
        if (supply < estimate_of_need) {
            current_responder_func("I'm going to need " + (estimate_of_need - supply) + " more " + current_block.name);
        }

        nextBlock();
    });

    var impossible_spaces = new Set();
    function nextBlock() {
        var this_one;
        (function() {
            for (var z = current_start.z; z < current_end.z; z++) {
                for (var y = current_start.y; y < current_end.y; y++) {
                    for (var x = current_start.x; x < current_end.x; x++) {
                        var point = new mf.Point(x, y, z);
                        if (impossible_spaces.contains(point)) {
                            continue;
                        }
                        if (mf.blockAt(point).type !== mf.ItemType.Air) {
                            continue;
                        }
                        this_one = point;
                        return;
                    }
                }
            }
        })();
        if (this_one === undefined) {
            if (impossible_spaces.size() === 0) {
                current_responder_func("done");
            } else {
                current_responder_func("couldn't place " + impossible_spaces.size() + " spaces");
            }
            stop();
            return;
        }
        navigator.navigateTo(this_one, {
            "end_radius": 4,
            "arrived_func": function() {
                placeAt(this_one);
            },
            "cant_find_func": function() {
                if (current_end === undefined) {
                    return;
                }
                impossible_spaces.add(this_one);
                nextBlock();
            },
        });
    }
    function placeAt(point) {
        if (!inventory.equipItem(current_block.id, function() {
            if (current_end === undefined) {
                return;
            }
            // try placing on any face that will work
            var faces = [
                mf.Face.NegativeX,
                mf.Face.PositiveX,
                mf.Face.NegativeY,
                mf.Face.PositiveY,
                mf.Face.NegativeZ,
                mf.Face.PositiveZ,
            ];
            var vectors = [
                new mf.Point( 1,  0,  0),
                new mf.Point(-1,  0,  0),
                new mf.Point( 0,  1,  0),
                new mf.Point( 0, -1,  0),
                new mf.Point( 0,  0,  1),
                new mf.Point( 0,  0, -1),
            ];
            for (var i = 0; i < faces.length; i++) {
                var other_point = point.plus(vectors[i]);
                if (mf.canPlaceBlock(other_point, faces[i])) {
                    mf.hax.placeBlock(other_point, faces[i]);
                    nextBlock();
                    return;
                }
            }
            impossible_spaces.add(point);
            nextBlock();
        })) {
            current_responder_func("out of " + current_block.name);
            stop();
        }
    }

    function stop() {
        current_instructor_id = undefined;
        current_start = undefined;
        current_end = undefined;
        impossible_spaces.clear();
    }
    chat_commands.registerCommand("stop", stop);
})();

