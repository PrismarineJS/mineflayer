mf.include("a_star.js");
mf.include("arrays.js");

var navigator = {};
(function() {
    navigator.monitor_interval = 40;
    /**
     * Finds a path to the specified location and goes there.
     * @param {Point} end Where you want to go.
     * @param {Object} params Optional parameters:
     *      is_end_func(point) - passed on to the a_star library. defaults to using params.end_radius.
     *      end_radius - used for default is_end_func. effectively defaults to 0.
     *      timeout_milliseconds - passed on to the a_star library.
     *      path_found_func(path) - called when a path is found. path is an array of nodes.
     *      cant_find_func() - called when a path can't be found.
     *      arrived_func() - called when the destination is reached.
     */
    navigator.navigateTo = function(end, params) {
        var start = mf.self().position.floored();
        end = end.floored();
        if (params.is_end_func === undefined) {
            if (params.end_radius !== undefined) {
                params.is_end_func = function(point) {
                    return point.distanceTo(end) <= params.end_radius;
                };
            } else {
                params.is_end_func = function(point) {
                    return point.equals(end);
                };
            }
        }
        var path = a_star.findPath({
            "start": start,
            "is_end_func": params.is_end_func,
            "neighbor_func": getNeighbors,
            "distance_func": function(a, b) { return a.distanceTo(b); },
            "heuristic_func": function(point) { return point.distanceTo(end); },
            "timeout_milliseconds": params.timeout_milliseconds,
        });
        if (path === undefined) {
            if (params.cant_find_func !== undefined) {
                params.cant_find_func();
            }
            return;
        } else {
            if (params.path_found_func !== undefined) {
                params.path_found_func(path);
            }
        }

        // start
        navigator.stop();
        // go to the centers of blocks
        current_completed_callback = params.arrived_func;
        current_course = path.mapped(function(point) { return point.offset(0.5, 0.5, 0); });
        previous_position = mf.self().position;
        current_callback_id = mf.setInterval(monitor_movement, navigator.monitor_interval);
    }
    navigator.stop = function() {
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
                navigator.stop();
                if (current_completed_callback !== undefined) {
                    current_completed_callback();
                }
                return;
            }
            // not done yet
            next_point = current_course[0];
        }
        var delta = next_point.minus(current_position);
        var gotta_jump;
        var horizontal_delta = Math.abs(delta.x + delta.y);
        if (delta.z > 0.1) {
            // gotta jump up when we're close enough
            gotta_jump = horizontal_delta < 1.75;
        } else if (delta.z > -0.1) {
            // possibly jump over a hole
            gotta_jump = 1.5 < horizontal_delta && horizontal_delta < 2.5;
        } else {
            gotta_jump = 2.4 < horizontal_delta && horizontal_delta < 2.7;
        }
        mf.setControlState(mf.Control.Jump, gotta_jump);

        // run toward next point
        var look_at_point = new mf.Point(next_point.x, next_point.y, current_position.z);
        mf.lookAt(look_at_point);
        mf.setControlState(mf.Control.Forward, true);

        previous_position = current_position;
    }
    var cardinal_direction_vectors = [
        new mf.Point( 0,  1, 0), // north
        new mf.Point( 0, -1, 0), // south
        new mf.Point( 1,  0, 0), // east
        new mf.Point(-1,  0, 0), // west
    ];
    function getNeighbors(point) {
        // for each cardinal direction:
        // "." is head. "+" is feet and current location.
        // "#" is initial floor which is always solid. "a"-"u" are blocks to check
        //
        //   --0123-- horizontal_offset
        //  |
        // +2  aho
        // +1  .bip
        //  0  +cjq
        // -1  #dkr
        // -2   els
        // -3   fmt
        // -4   gn
        //  |
        //  dz
        //
        var is_safe_a = mf.isSafe(mf.blockAt(point.offset(0, 0, 2)).type);
        var result = [];
        for (var i = 0; i < cardinal_direction_vectors.length; i++) {
            var direction_vector = cardinal_direction_vectors[i];
            function pointAt(horizontal_offset, dz) {
                return point.offset(direction_vector.x * horizontal_offset, direction_vector.y * horizontal_offset, dz);
            }
            function properties(point) {
                var type = mf.blockAt(point).type;
                return {
                    "safe": mf.isSafe(type),
                    "physical": mf.isPhysical(type),
                };
            }
            var point_b = pointAt(1, 1);
            var block_b = properties(point_b);
            if (!block_b.safe) {
                // we can do nothing in this direction
                continue;
            }
            var point_c = pointAt(1, 0);
            var block_c = properties(point_c);
            if (!block_c.safe) {
                // can't walk forward
                if (!block_c.physical) {
                    // too dangerous
                    continue;
                }
                if (!is_safe_a) {
                    // can't jump
                    continue;
                }
                var block_h = properties(pointAt(1, 2));
                if (!block_h.safe) {
                    // no head room to stand on c
                    continue;
                }
                // can jump up onto c
                result.push(point_b);
                continue;
            }
            // c is open
            var point_d = pointAt(1, -1);
            var block_d = properties(point_d);
            if (block_d.physical) {
                // can walk onto d. this is the case of flat ground.
                result.push(point_c);
                continue;
            }
            if (block_d.safe) {
                // safe to drop through d
                var point_e = pointAt(1, -2);
                var block_e = properties(point_e);
                if (block_e.physical) {
                    // can drop onto e
                    result.push(point_d);
                } else if (block_e.safe) {
                    // can drop through e
                    var point_f = pointAt(1, -3);
                    var block_f = properties(point_f);
                    if (block_f.physical) {
                        // can drop onto f
                        result.push(point_e);
                    } else if (block_f.safe) {
                        // can drop through f
                        var block_g = properties(pointAt(1, -4));
                        if (block_g.physical) {
                            result.push(point_f);
                        }
                    }
                }
            }
            // might be able to jump over the d hole.
            block_h = properties(pointAt(1, 2));
            var block_o = properties(pointAt(2, 2));
            var can_jump_forward = is_safe_a && block_h.safe && block_o.safe;

            var point_i = pointAt(2, 1);
            var block_i = properties(point_i);
            var point_j = pointAt(2, 0);
            var block_j = properties(point_j);
            if (can_jump_forward && block_i.safe && block_j.physical) {
                // can jump over and up onto j
                result.push(point_i);
            }
            var point_k = pointAt(2, -1);
            var block_k = properties(point_k);
            var can_jump_past_j = can_jump_forward;
            if (can_jump_forward && block_j.safe && block_k.physical) {
                // can jump over onto k
                result.push(point_j);
                can_jump_past_j = false;
            }

            // might be able to walk and drop forward
            var point_l = pointAt(2, -2);
            var block_l = properties(point_l);
            if (block_j.safe && block_k.safe && block_l.physical) {
                // can walk and drop onto l
                result.push(point_k);
            }

            if (block_e === undefined) {
                block_e = properties(pointAt(1, -2));
            }
            if (block_e.safe) {
                // can drop through e
                var point_m = pointAt(2, -3);
                var block_m = properties(point_m);
                if (block_k.safe && block_l.safe && block_m.physical) {
                    // can walk and drop onto m
                    result.push(point_l);
                }
                var block_n = properties(pointAt(2, -4));
                if (block_l.safe && block_m.safe && block_n.physical) {
                    // can walk and drop onto n
                    result.push(point_m);
                }
            }
            if (!can_jump_past_j) {
                continue;
            }
            // 3rd column
            var block_p = properties(pointAt(3, 1));
            var point_q = pointAt(3, 0);
            var block_q = properties(point_q);
            var point_r = pointAt(3, -1);
            var block_r = properties(point_r);
            if (block_p.safe && block_q.safe && block_r.physical) {
                // can jump way over onto r
                result.push(point_q);
                continue;
            }
            var point_s = pointAt(3, -2);
            var block_s = properties(point_s);
            if (block_q.safe && block_r.safe && block_s.physical) {
                // can jump way over and down onto s
                result.push(point_r);
                continue;
            }
            var block_t = properties(pointAt(3, -3));
            if (block_r.safe && block_s.safe && block_t.physical) {
                // can jump way over and down onto t
                result.push(point_s);
                continue;
            }
        }
        return result;
    }
})();

