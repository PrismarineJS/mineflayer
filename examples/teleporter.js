
mf.include("json.js");
mf.include("chat_commands.js");
mf.include("assert.js");

mf.include("connection_notice.js");

var teleporter;
if (teleporter === undefined) {
    teleporter = function() {
        var _public = {};
        _public.debug = true;

        function respond(message) {
            if (_public.debug) {
                mf.debug(message);
            }
            mf.chat(message);
        }

        function hereis(username, args) {
            var point_name = args[0];
            var entity = namedEntity(username);
            if (entity === undefined) {
                respond("sorry, can't see user: " + username);
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
            message = ["point", point_name, created_or_updated, "at", point.x, point.y, point.z].join(" ");
            respond(message);
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
            mf.writeFile(database_file_name, json.stringify(name_to_point));
        }
        function load_database() {
            name_to_point = json.parse(mf.readFile(database_file_name));
            if (name_to_point === undefined) {
                name_to_point = {};
            }
        }
        load_database();

        // track user's entity_id's
        var username_to_entity_id = {};
        mf.onEntitySpawn(function(entity_id) {
            var entity = mf.entity(entity_id);
            if (entity.type !== mf.EntityType.Player) {
                return;
            }
            username_to_entity_id[entity.username] = entity_id;
        });
        mf.onEntityDespawn(function(entity_id) {
            delete username_to_entity_id[entity_id];
        });
        function namedEntity(username) {
            var entity_id = username_to_entity_id[username];
            if (entity_id === undefined) {
                return undefined;
            }
            return mf.entity(entity_id);
        }
    }();
}

