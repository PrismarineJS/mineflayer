
mf.include("chat_commands.js");
mf.include("assert.js");

mf.include("connection_notice.js");

var teleporter;
if (teleporter === undefined) {
    teleporter = function() {
        var _public = {};
        _public.enabled = true;
        _public.debug = true;

        function respond(message) {
            if (_public.debug) {
                mf.debug(message);
            }
            mf.chat(message);
        }

        function hereis(username, args) {
            var point_name = args[0];
            var entity_id = mf.userEntityId(username);
            if (entity_id === undefined) {
                // TODO: teleport to them first
                respond("sorry, can't see user: " + username);
                return;
            }
            var entity_state = mf.entityState(entity_id);
            if (entity_state === undefined) {
                respond("wtf. entity state is undefined");
                return;
            }
            var point = entity_state.position;
            point.x = Math.round(point.x);
            point.y = Math.round(point.y);
            point.z = Math.round(point.z);
            var old_point = name_to_point[point_name];
            name_to_point[point_name] = point;
            save_database();
            var created_or_updated;
            if (old_point === undefined) {
                created_or_updated = "created";
            } else {
                created_or_updated = "updated";
            }
            message = ["point", point_name, created_or_updated, "at", point.x, point.y, point.z].join(" ");
            mf.chat(message);
        }
        chat_commands.register("hereis", hereis, 1, 1);

        function zapto(username, args) {
            var point_name = args[0];
            var point = name_to_point[point_name];
            if (point === undefined) {
                respond("not a recognized name: " + point_name);
                return;
            }
            //check point is accessible
            for (var z = point.z; z < point.z + 2; z++) {
                if (mf.pointAt(mf.Point(point.x, point.y, z)).type != mf.ItemType.Air) {
                    respond("that's not air. can't go there");
                    return;
                }
            }
            mf.hax.setPosition(point);
            mf.chat("/tp " + username + " " + mf.username());
            mf.hax.setPosition(mf.Point(0, 0, 0));
        }
        chat_commands.register("zapto", zapto, 1, 1);

        var name_to_point;
        var database_file_name = "teleport_points.json";
        function save_database() {
            mf.write(database_file_name, name_to_point);
        }
        function load_database() {
            name_to_point = mf.read(database_file_name);
            if (name_to_point === undefined) {
                name_to_point = {};
            }
        }
        load_database();
    }();
}

