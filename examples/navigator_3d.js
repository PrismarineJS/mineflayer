
mf.include("path_finder.js");
mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("arrays.js");

mf.include("connection_notice.js");
mf.include("auto_respawn.js");
mf.include("quitter.js");

var path_finder_3d;
if (path_finder_3d === undefined) {
    path_finder_3d = function() {
        var _public = {};
        _public.enabled = true;
        _public.debug = true;
        _public.verbose = true;
        _public.monitor_interval = 40;
        chat_commands.registerModule("path_finder_3d", _public);
        function navhere(username, args) {
            var entity = player_tracker.entityForPlayer(username);
            if (entity === undefined) {
                respond("sorry, can't see you");
                return;
            }
            function isPointStandable(point) {
                return (
                    // leg room
                    !mf.isPhysical(mf.blockAt(point).type) &&
                    // head room
                    !mf.isPhysical(mf.blockAt(point.offset(0, 0, 1)).type) &&
                    // stand on something
                    mf.isPhysical(mf.blockAt(point.offset(0, 0, -1)).type));
            }
            function xyNeighbors(point) {
                return [
                    // walking
                    point.offset(-1,  0, 0),
                    point.offset( 0, -1, 0),
                    point.offset( 0,  1, 0),
                    point.offset( 1,  0, 0),
                ];
            }
            var start = mf.self().position.floored();
            var end = entity.position.floored();
            respond("looking for a path from " + start + " to " + end + "...");
            var path = path_finder.findPath({
                "start": start,
                "end": end,
                "equator_func": function(a, b) { return a.equals(b); },
                "neighbor_func": function(point) {
                    xy_neighbors = xyNeighbors(point);
                    return [].concat(
                        // walking
                        xy_neighbors,
                        // jumping up
                        xy_neighbors.mapped(function(point) { return point.offset(0, 0, 1); }).filtered(function() {
                            // must have room above your current head position
                            // this is being done 4 times instead of once. optimize later.
                            return !mf.isPhysical(mf.blockAt(point.offset(0, 0, 2)).type);
                        }),
                        // falling down 1
                        xy_neighbors.mapped(function(point) { return point.offset(0, 0, -1); }).filtered(function(point) {
                            // must have head room before drop
                            return !mf.isPhysical(mf.blockAt(point.offset(0, 0, 2)).type);
                        })
                    ).filtered(isPointStandable);
                },
                "distance_func": function(a, b) { return a.distanceTo(b); },
                "heuristic_func": function(point) { return point.distanceTo(end); },
            });
            if (path === undefined) {
                respond("can't get there");
                return;
            }
            respond("found a path. i can get there in " + (path.length - 1) + " moves");
            start_going(path);
        }
        chat_commands.registerCommand("navhere", navhere);
        function start_going(path) {
            stop_going();
            // go to the centers of blocks
            current_course = path.mapped(function(point) { return point.offset(0.5, 0.5, 0); });
            previous_position = mf.self().position;
            current_callback_id = mf.setInterval(monitor_movement, _public.monitor_interval);
        }
        function stop_going() {
            if (current_callback_id === undefined) {
                return; // already stopped
            }
            mf.clearInterval(current_callback_id);
            mf.clearControlStates();
        }
        chat_commands.registerCommand("stop", stop_going);

        var current_callback_id;
        var current_course = [];
        var previous_position;
        function monitor_movement() {
            var next_point = current_course[0];
            var current_position = mf.self().position;
            if (current_position.distanceTo(next_point) <= 0.2) {
                // arrived at next point
                current_course.shift();
                if (current_course.length === 0) {
                    // done
                    stop_going();
                    respond("i have arrived");
                    return;
                }
                // not done yet
                next_point = current_course[0];
            }
            if (next_point.minus(current_position).z > 0) {
                // gotta jump
                mf.setControlState(mf.Control.Jump, true);
            } else {
                // don't gotta jump
                mf.setControlState(mf.Control.Jump, false);
            }

            // run toward next point
            mf.lookAt(next_point);
            mf.setControlState(mf.Control.Forward, true);

            previous_position = current_position;
        }
        function debug(message) {
            if (_public.debug) {
                mf.debug(message);
            }
        }
        function respond(message) {
            debug(message);
            if (_public.verbose) {
                mf.chat(message);
            }
        }

        return _public;
    }();
}

