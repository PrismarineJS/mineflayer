
mf.include("json.js");
mf.include("chat_commands.js");
mf.include("assert.js");

mf.include("connection_notice.js");

var teleporter;
if (teleporter === undefined) {
    teleporter = function() {
        var _public = {};
        _public.debug = true;
        _public.delay = 400;

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
        chat_commands.register("hereis", hereis, 1);

        function zap(username, args) {
            var target_user = args.shift();
            if (target_user === "me") {
                target_user = username;
            } else if (target_user === "you" || target_user === "yourself") {
                target_user = mf.username();
            }
            zapto(target_user, args);
        }
        chat_commands.register("zap", zap, 2);

        function zapto(username, args) {
            var point_name = args[0];
            var point = name_to_point[point_name];
            if (point === undefined) {
                respond("not a recognized name: " + point_name);
                return;
            }
            //check point is accessible
            for (var z = point.z; z < point.z + 2; z++) {
                if (mf.blockAt(new mf.Point(point.x, point.y, z)).type != mf.ItemType.Air) {
                    respond("that's not air. can't go there");
                    return;
                }
            }
            var old_position = mf.self().position;
            mf.hax.setPosition(point);
            mf.setTimeout(function() {
                mf.chat("/tp " + username + " " + mf.username());
                mf.setTimeout(function() {
                    mf.hax.setPosition(old_position);
                }, _public.delay);
            }, _public.delay);
        }
        chat_commands.register("zapto", zapto, 1);

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

        // track user's entity_id's
        var username_to_entity_id = {};
        mf.onEntitySpawned(function(entity) {
            if (entity.type !== mf.EntityType.Player) {
                return;
            }
            mf.debug("i see " + entity.username);
            username_to_entity_id[entity.username] = entity.entity_id;
        });
        mf.onEntityDespawned(function(entity) {
            if (entity.type !== mf.EntityType.Player) {
                return;
            }
            mf.debug("i no longer see " + entity.username);
            delete username_to_entity_id[entity.username];
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

