mf.include("chat_commands.js");
mf.include("task_manager.js");
mf.include("player_tracker.js");

chat_commands.registerCommand("drill", function(speaker_name, args, responder_func) {
    var player_entity = player_tracker.entityForPlayer(speaker_name);
    if (player_entity === undefined) {
        responder_func("sorry, can't see you");
        return;
    }
    var starting_point = player_entity.position.floored();
    var pitch_round_size = Math.PI / 4; // 45 degrees
    var shape_name;
    var height, width;
    var min_height, max_height, min_width, max_width;
    switch (Math.round(player_entity.pitch / pitch_round_size)) {
        case -2: // straight down
        case 2: // straight up
            shape_name = "spiral shaft";
            break;
        case -1: // sloped down
        case 1: // sloped up
            shape_name = "sloped stairs";
            break;
        case 0: // horizontal
            shape_name = "hallway";
            min_height = 2;
            max_height = 5;
            width = min_width;
            min_width = 1;
            max_width = Infinity;
            height = min_height;
            break;
        default:
            throw "inhuman pitch";
    }
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        function parseIntOrComplain(string) {
            var result = parseInt(string);
            if (!isNaN(result)) {
                return result;
            }
            responder_func("not a number: " + string);
            return undefined;
        }
        if (arg.startsWith("w=")) {
            width = parseIntOrComplain(arg.substr("w=".length));
        } else if (arg.startsWith("h=")) {
            height = parseIntOrComplain(arg.substr("h=".length));
        } else {
            responder_func("usage: args must start with \"h=\" or \"w=\"");
            return;
        }
    }
    function checkDimensions() {
        if (width % 2 != 1) {
            responder_func("width must be an odd number");
        } else if (width < min_width) {
            responder_func("minimum width for " + shape_name + " is " + min_width);
        } else if (width > max_width) {
            responder_func("maximum width for " + shape_name + " is " + max_width);
        } else if (height < min_height) {
            responder_func("minimum height for " + shape_name + " is " + min_height);
        } else if (height > max_height) {
            responder_func("maximum height for " + shape_name + " is " + max_height);
        } else {
            return true;
        }
        return false;
    }
    if (width === undefined || height === undefined || !checkDimensions()) {
        return;
    }
    var yaw_round_size = Math.PI / 2; // 90 degrees
    var cardinal_yaw = Math.round(player_entity.yaw / yaw_round_size);
    var xy_traversal_order;
    var forward_coordinate_name;
    var sideways_coordinate_name;
    var forward_direction = 1;
    switch (cardinal_yaw) {
        case 2: // south
            forward_direction = -1;
            // fallthrough
        case 0: // north
        case 4: // north
            forward_coordinate_name = "y";
            sideways_coordinate_name = "x";
            xy_traversal_order = ["y", "x"];
            break;

        case 3: // west
            forward_direction = -1;
            // fallthrough
        case 1: // east
            forward_coordinate_name = "x";
            sideways_coordinate_name = "y";
            break;
        default:
            throw "impossible yaw";
    }
    var min_corner = starting_point.clone();
    min_corner[sideways_coordinate_name] -= (width - 1) / 2;
    var max_corner = min_corner.offset(0, 0, height);
    max_corner[sideways_coordinate_name] += width;
    var plate_coordinates = [];
    for (var x_or_y = min_corner[sideways_coordinate_name]; x_or_y < max_corner[sideways_coordinate_name]; x_or_y++) {
        for (var z = min_corner.z; z < max_corner.z; z++) {
            var point = player_position.clone();
            point[sideways_coordinate_name] = x_or_y;
            point.z = z;
            plate_coordinates.push(point);
        }
    }
    var plate_coordinate_index = 0;
    var forward_progress = starting_point[forward_coordinate_name];

    function getNextBlock() {
        var location = plate_coordinates[plate_coordinate_index++];
        location[forward_coordinate_name] = forward_progress;
        if (plate_coordinate_index === plate_coordinates.length) {
            plate_coordinate_index = 0;
            forward_progress += forward_direction;
        }
        return location;
    }
    var running = true;
    function startDiggingNextBlock() {
        var current_block;
        while (true) {
            current_block = getNextBlock();
            if (!mf.isDiggable(current_block)) {
                continue;
            }
        }
        navigator.navigateTo(current_block, {
        };
    }
    function start() {
        running = true;
        responder_func("drilling " + shape_name);
        startDiggingNextBlock();
    }
    function stop() {
        running = false;
    }
    var task_name = "drill " + shape_name + " w=" + width + " h=" + height;
    task_manager.doLater(new task_manager.Task(start, stop, task_name);
}, 0, 2);

