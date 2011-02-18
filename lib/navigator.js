
mf.include("path_finder.js");
mf.include("arrays.js");

var navigator;
if (navigator === undefined) {
    navigator = function() {
        var _public = {};
        _public.debug = true;
        _public.verbose = true;
        _public.monitor_interval = 40;
        _public.navigateTo = function(end, callback, tolerance) {
            if (tolerance === undefined) {
                tolerance = 0.1;
            }
            function isPointStandable(point) {
                return (
                    // leg room
                    mf.isSafe(mf.blockAt(point).type) &&
                    // head room
                    mf.isSafe(mf.blockAt(point.offset(0, 0, 1)).type) &&
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
            end = end.floored();
            respond("looking for a path from " + start + " to " + end + "...");
            var path = path_finder.findPath({
                "start": start,
                "is_end_func": function(point) { return end.distanceTo(point) <= tolerance; },
                "neighbor_func": function(point) {
                    xy_neighbors = xyNeighbors(point);
                    return [].concat(
                        // walking
                        xy_neighbors,
                        // jumping up
                        xy_neighbors.mapped(function(point) { return point.offset(0, 0, 1); }).filtered(function() {
                            // must have room above your current head position
                            // this is being done 4 times instead of once. optimize later.
                            return mf.isSafe(mf.blockAt(point.offset(0, 0, 2)).type);
                        }),
                        // falling down 1
                        xy_neighbors.mapped(function(point) { return point.offset(0, 0, -1); }).filtered(function(point) {
                            // must have head room before drop
                            return mf.isSafe(mf.blockAt(point.offset(0, 0, 2)).type);
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

            // start
            _public.stop();
            // go to the centers of blocks
            current_completed_callback = callback;
            current_course = path.mapped(function(point) { return point.offset(0.5, 0.5, 0); });
            previous_position = mf.self().position;
            current_callback_id = mf.setInterval(monitor_movement, _public.monitor_interval);
        }
        _public.stop = function() {
            if (current_callback_id === undefined) {
                return; // already stopped
            }
            mf.clearInterval(current_callback_id);
            mf.clearControlStates();
        }

        var current_callback_id;
        var current_completed_callback;
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
                    _public.stop();
                    if (typeof current_completed_callback === "function") {
                        current_completed_callback();
                    }
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

