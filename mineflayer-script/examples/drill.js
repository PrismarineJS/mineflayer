mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("builder.js");

(function() {
    function drillOrTunnelOrSomething(speaker_name, args, responder_func, make_construction_project_func) {
        var player_entity = player_tracker.entityForPlayer(speaker_name);
        if (player_entity === undefined) {
            responder_func("sorry, can't see you");
            return;
        }
        function parseAndCheckInt(string_maybe, min, max, default_value) {
            if (string_maybe === undefined) {
                return default_value;
            }
            var value = parseInt(string_maybe);
            if (isNaN(value)) {
                responder_func("not a number: " + string_maybe);
                return undefined;
            }
            if (value < min) {
                responder_func("value must be at least " + min + " not " + value);
                return undefined;
            }
            if (max !== undefined && value > max) {
                responder_func("value must be at most " + max + " not " + value);
                return undefined;
            }
            return value;
        }
        var width = parseAndCheckInt(args.shift(), 1, undefined, 1);
        var height = parseAndCheckInt(args.shift(), 2, 5, 2);
        if (width === undefined || height === undefined) {
            return;
        }
        var half_width = (width - 1)/ 2;

        var yaw_round_size = Math.PI / 2; // 90 degrees
        var cardinal_yaw = Math.round(player_entity.yaw / yaw_round_size) % 4;
        var forward_vectors = [
            new mf.Point(0, 0, -1), // east
            new mf.Point(-1, 0, 0), // north
            new mf.Point(0, 0, 1), // west
            new mf.Point(1, 0, 0), // south
        ];
        var forward_vector = forward_vectors[cardinal_yaw];
        var sideways_vector = forward_vectors[(cardinal_yaw + 1) % 4].abs();

        var cursor;
        if (half_width % 1 === 0) {
            cursor = player_entity.position.floored();
        } else {
            var half_vector = sideways_vector.scaled(0.5)
            cursor = player_entity.position.minus(half_vector).floored().plus(half_vector);
        }
        // always move the cursor forward at first
        cursor = cursor.plus(forward_vector);
        var cursor_to_min_corner = sideways_vector.scaled(-half_width);
        var cursor_to_max_corner = sideways_vector.scaled(half_width).offset(0, height, 0);

        var construction_project = make_construction_project_func(cursor, sideways_vector, forward_vector, cursor_to_min_corner, cursor_to_max_corner);
        builder.startBuilding(construction_project, "drilling w=" + width + " h=" + height, responder_func);
    }

    chat_commands.registerCommand("drill", function(speaker_name, args, responder_func) {
        var make_construction_project_func = function(cursor, sideways_vector, forward_vector, cursor_to_min_corner, cursor_to_max_corner) {
            var construction_project = {};
            construction_project.nextGroup = function() {
                var min_corner = cursor.plus(cursor_to_min_corner);
                var max_corner = cursor.plus(cursor_to_max_corner);
                var height = cursor_to_max_corner.y;
                var result = [];
                for (var h = 0; h < height; h++) {
                    for (var sub_cursor = min_corner.offset(0, h, 0); sub_cursor.x <= max_corner.x && sub_cursor.z <= max_corner.z; sub_cursor = sub_cursor.plus(sideways_vector)) {
                        result.push(builder.makeNonSolidBlockSpec(sub_cursor));
                    }
                }
                cursor = cursor.plus(forward_vector);
                return result;
            };
            return construction_project;
        };
        drillOrTunnelOrSomething(speaker_name, args, responder_func, make_construction_project_func);
    }, 0, 2);


    function makeWallBlockSpec(point) {
        function isBlockAcceptable(block) {
            return mf.isPhysical(block.type);
        }
        var placement_choices = [
            new mf.Item(mf.ItemType.Cobblestone),
            new mf.Item(mf.ItemType.Dirt),
        ];
        var placement_description = "cobblestone/dirt";
        return new builder.BlockSpec(point, isBlockAcceptable, placement_choices, placement_description);
    }
    chat_commands.registerCommand("tunnel", function(speaker_name, args, responder_func) {
        var make_construction_project_func = function(cursor, sideways_vector, forward_vector, cursor_to_min_corner, cursor_to_max_corner) {
            var construction_project = {};
            construction_project.nextGroup = function() {
                var min_corner = cursor.plus(cursor_to_min_corner);
                var max_corner = cursor.plus(cursor_to_max_corner);
                var height = cursor_to_max_corner.y;
                var result = [];
                var first_wall_yet = false;
                for (var h = 0; h < height; h++) {
                    first_wall_yet = false;
                    for (var point = min_corner.offset(0, h, 0); point.x <= max_corner.x && point.z <= max_corner.z; point = point.plus(sideways_vector)) {
                        result.push(new builder.BlockSpec(point, new mf.Block(mf.ItemType.Air)));
                        if (h === 0) {
                            // floor
                            result.push(makeWallBlockSpec(point.offset(0, -1, 0)));
                        } else if (h === height - 1) {
                            // ceiling
                            result.push(makeWallBlockSpec(point.offset(0, 1, 0)));
                        }
                        if (!first_wall_yet) {
                            result.push(makeWallBlockSpec(point.minus(sideways_vector)));
                            first_wall_yet = true;
                        }
                    }
                    // last wall
                    result.push(makeWallBlockSpec(point));
                }

                cursor = cursor.plus(forward_vector);
                return result;
            };
            return construction_project;
        };
        drillOrTunnelOrSomething(speaker_name, args, responder_func, make_construction_project_func);
    }, 0, 2);
})();
