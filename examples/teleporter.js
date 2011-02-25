mf.include("json.js");
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("assert.js");

mf.include("connection_notice.js");

(function() {
    function hereis(username, args, responder_func) {
        var point_name = args[0];
        var entity = player_tracker.entityForPlayer(username);
        if (entity === undefined) {
            responder_func("sorry, can't see user: " + username);
            return;
        }
        var point = entity.position;
        var old_point = name_to_point[point_name];
        name_to_point[point_name] = point;
        save_database();
        var created_or_updated;
        if (old_point === undefined) {
            created_or_updated = "created";
        } else {
            created_or_updated = "updated";
        }
        message = ["point", point_name, created_or_updated, "at", point].join(" ");
        responder_func(message);
    }
    chat_commands.registerCommand("hereis", hereis, 1);

    function zap(username, args) {
        var target_user = args.shift();
        if (target_user === "me") {
            target_user = username;
        } else if (target_user === "you" || target_user === "yourself") {
            target_user = mf.self().username;
        }
        zapto(target_user, args);
    }
    chat_commands.registerCommand("zap", zap, 2);

    function zapto(username, args, responder_func) {
        var point_name = args[0];
        var destination = name_to_point[point_name];
        if (destination === undefined) {
            responder_func("not a recognized name: " + point_name);
            return;
        }
        // check current position is escapable
        var my_position = mf.self().position;
        var z;
        for (z = my_position.z; z < 128; z++) {
            if (mf.isPhysical(mf.blockAt(new mf.Point(my_position.x, my_position.y, z)).type)) {
                responder_func("i can't see the sky");
                return;
            }
        }
        // check destination is accessible
        for (z = destination.z; z < 128; z++) {
            if (mf.isPhysical(mf.blockAt(new mf.Point(destination.x, destination.y, z)).type)) {
                responder_func("destination does not have a view of the sky");
                return;
            }
        }
        function arrived() {
            if (!mf.self().position.floored().equals(destination.floored())) {
                responder_func("unable to reach destination");
                return;
            }
            var my_name = mf.self().username;
            if (username !== my_name) {
                mf.chat("/tp " + username + " " + my_name);
            }
        }
        // soar through the sky at z=128 to avoid colliding with anything
        //
        //          2------3
        //          |      |
        //          |      |
        // start -> 1      4
        //
        // snap to grid at point 1 so our bounding box can fit in 1x1 space
        var point1 = my_position.floored().offset(0.5, 0.5, 0);
        var point2 = new mf.Point(point1.x, point1.y, 128);
        var point4 = destination.floored().offset(0.5, 0.5, 0);
        var point3 = new mf.Point(point4.x, point1.y, 128);
        function makeGotoFunc(point, nextFunc) {
            return function() {
                mf.hax.setPosition(point);
                mf.setTimeout(nextFunc, mf.hax.positionUpdateInterval() * 2);
            };
        }
        var goto4 = makeGotoFunc(point4, arrived);
        var goto3 = makeGotoFunc(point3, goto4);
        var goto2 = makeGotoFunc(point2, goto3);
        var goto1 = makeGotoFunc(point1, goto2);
        goto1();
    }
    chat_commands.registerCommand("zapto", zapto, 1);

    var name_to_point;
    var database_file_name = "teleport_points.json";
    function save_database() {
        mf.writeFile(database_file_name, json.stringify(name_to_point));
    }
    function load_database() {
        var database_contents = mf.readFile(database_file_name);
        if (database_contents !== undefined) {
            name_to_point = json.parse(database_contents);
        } else {
            name_to_point = {};
        }
    }
    load_database();
})();
