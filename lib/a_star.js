mf.include("assert.js");
mf.include("Heap.js");
mf.include("Map.js");
mf.include("Set.js");

var a_star = function() {
    var _public = {};
    /**
     * Pass all the params to this function as an object with named properties.
     * This makes invocations clearer. The data type for nodes is unrestricted.
     * @param params object with these properties:
     *     start - the start node
     *     is_end_func(n) - function that returns whether a node is an acceptable end.
     *     neighbor_func(n) - function that returns an array of neighbors for a node.
     *     distance_func(a, b) - function that returns the distance cost between two nodes.
     *     heuristic_func(n) - function that returns the heuristic guess for a node. the smaller the better.
     *     timeout_milliseconds - optional limit to the amount of time to search before returning undefined.
     * @return array of nodes including start and end, or undefined if no path is found
     */
    _public.findPath = function(params) {
        assert.isTrue(params.start !== undefined);
        assert.isTrue(params.is_end_func !== undefined);
        assert.isFunction(params.neighbor_func);
        assert.isFunction(params.distance_func);
        assert.isFunction(params.heuristic_func);
        if (params.timeout_milliseconds === undefined) {
            params.timeout_milliseconds = Infinity;
        }
        assert.isNumber(params.timeout_milliseconds);

        var start_node = {
            "data": params.start,
            "g": 0,
            "h": params.heuristic_func(params.start),
        };
        start_node.f = start_node.h;
        // leave .parent undefined
        var closed_data_set = new Set();
        var open_heap = new Heap(function(node) { return node.f; });
        var open_data_map = new Map();
        open_heap.add(start_node);
        open_data_map.put(start_node.data, start_node);
        var start_time = new Date().getTime();
        while (!open_data_map.isEmpty()) {
            if (new Date().getTime() - start_time > params.timeout_milliseconds) {
                break;
            }
            var node = open_heap.take();
            open_data_map.remove(node.data);
            if (params.is_end_func(node.data)) {
                // done
                function reconstruct_path(node) {
                    if (node.parent !== undefined) {
                        var path_so_far = reconstruct_path(node.parent);
                        path_so_far.push(node.data);
                        return path_so_far;
                    } else {
                        // this is the starting node
                        return [node.data];
                    }
                }
                return reconstruct_path(node);
            }
            // not done yet
            closed_data_set.add(node.data);
            var neighbors = params.neighbor_func(node.data);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor_data = neighbors[i];
                if (closed_data_set.contains(neighbor_data)) {
                    // skip closed neighbors
                    continue;
                }
                var g_from_this_node = node.g + params.distance_func(node.data, neighbor_data);
                var neighbor_node = open_data_map.get(neighbor_data);
                var update = false;
                if (neighbor_node === undefined) {
                    // add neighbor to the open set
                    neighbor_node = {
                        "data": neighbor_data,
                    };
                    // other properties will be set later
                    open_data_map.put(neighbor_data, neighbor_node);
                } else {
                    if (neighbor_node.g < g_from_this_node) {
                        // skip this one because another route is faster
                        continue;
                    }
                    update = true;
                }
                // found a new or better route.
                // update this neighbor with this node as its new parent
                neighbor_node.parent = node;
                neighbor_node.g = g_from_this_node;
                neighbor_node.h = params.heuristic_func(neighbor_data);
                neighbor_node.f = g_from_this_node + neighbor_node.h;
                if (update) {
                    open_heap.reheapify();
                } else {
                    open_heap.add(neighbor_node);
                }
            }
        }
        // all the neighbors of every accessible node have been exhausted,
        // or timeout has occurred.
        // path is impossible.
        return undefined;
    };
    return _public;
}();
