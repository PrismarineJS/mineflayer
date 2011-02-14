
mf.include("Heap.js");
mf.include("Map.js");
mf.include("Set.js");

var path;
if (path === undefined) {
    path = function() {
        var _public = {};
        _public.findPath = function(params) {
            assert.isTrue(params.start !== undefined);
            assert.isTrue(params.end !== undefined);
            assert.isFunction(params.equator_func);
            assert.isFunction(params.neighbor_func);
            assert.isFunction(params.distance_func);
            assert.isFunction(params.heuristic_func);
            var start_node = {
                "data": params.start,
                "g": 0,
                "h": params.heuristic_func(params.start),
            };
            start_node.f = start_node.h;
            // leave .parent undefined
            var closed_data_set = new Set();
            var open_heap = new Heap(undefined, function(node) { return node.f; });
            var open_data_map = new Map();
            open_heap.add(start_node);
            open_data_map.put(start_node.data, start_node);
            while (!open_data_map.isEmpty()) {
                var node = open_heap.take();
                open_data_map.remove(node.data);
                if (params.equator_func(node.data, params.end)) {
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
                    var g_from_this_node = node.g + params.distance_func(node, neighbor_data);
                    var neighbor_node = open_data_map.get(neighbor_data);
                    if (neighbor_node === undefined) {
                        // add neighbor to the open set
                        neighbor_node = {
                            "data": neighbor_data,
                        };
                        // other properties will be set later
                        open_data_map.put(neighbor_data, neighbor_node);
                        open_heap.add(neighbor_node);
                    } else {
                        if (neighbor_node.g < g_from_this_node) {
                            // skip this one because another route is faster
                            continue;
                        }
                    }
                    // found a new or better route.
                    // update this neighbor with this node as its new parent
                    neighbor_node.parent = node;
                    neighbor_node.g = g_from_this_node;
                    neighbor_node.h = params.heuristic_func(neighbor_data);
                    neighbor_node.f = g_from_this_node + neighbor_data.h;
                }
            }
            // all the neighbors of every accessible node have been exhausted.
            // path is impossible.
            return undefined;
        };
        return _public;
    }();
}

