mf.include("Set.js");

var block_finder = function() {
    var _public = {};

    var unit = [
        new mf.Point(-1,  0,  0),
        new mf.Point( 1,  0,  0),
        new mf.Point( 0,  1,  0),
        new mf.Point( 0, -1,  0),
        new mf.Point( 0,  0,  1),
        new mf.Point( 0,  0, -1),
    ];

    var zeroed = [
        new mf.Point(0, 1, 1),
        new mf.Point(0, 1, 1),
        new mf.Point(1, 0, 1),
        new mf.Point(1, 0, 1),
        new mf.Point(1, 1, 0),
        new mf.Point(1, 1, 0),
    ];

    /**
     * Find the nearest block from a point. Note that this is only
     * aproximately near. It searches cubicly outward. 
     * Also it will not attempt to search beyond what is loaded in memory.
     * So this method might return different values before and after you
     * receive an onChunkUpdated event.
     * @param {mf.Point} point The location to start the search from
     * @param {ItemType} item_id The item id of the block to look for, or array of item ids
     * @param {Number} [radius] Maximum distance from point to search.
     *                          Defaults to 128.
     * @param {Number} [count] Maximum number of blocks to return.
     * @returns {Array} An array of mf.Point. The location of between 0
     * and count nearest blocks.
     */
    _public.findNearest = function(point, item_id, radius, count) {
        var max_apothem = (radius === undefined) ? 64 : radius;
        if (count === undefined) {
            count = 1;
        }
        var matches;
        if (typeof item_id === "number") {
            matches = function(block_type) {
                return item_id === block_type;
            }
        } else {
            var matching_set = new Set();
            for (var i = 0; i < item_id.length; i++) {
                matching_set.add(item_id[i]);
            }
            matches = function(block_type) {
                return matching_set.contains(block_type);
            }
        }

        var result = [];
        if (matches(mf.blockAt(point).type)) {
            result.push(point);
            if (count <= 1) {
                return result;
            }
        }

        var pt = new mf.Point(0, 0, 0); 
        for (var apothem = 1; apothem <= max_apothem; apothem++) {
            for (var side = 0; side < 6; side++) {
                var max = zeroed[side].scaled(2 * apothem);
                if (max.z > 127) {
                    max.z = 127;
                } else if (max.z < 0) {
                    max.z = 0;
                }
                for (pt.x = 0; pt.x <= max.x; pt.x++) {
                    for (pt.y = 0; pt.y <= max.y; pt.y++) {
                        for (pt.z = 0; pt.z <= max.z; pt.z++) {
                            var offset = pt.minus(max.scaled(0.5).floored()).plus(unit[side].scaled(apothem));
                            var abs_coords = point.plus(offset);
                            if (matches(mf.blockAt(abs_coords).type)) {
                                result.push(abs_coords);
                                if (result.length >= count) {
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
    /**
    * Finds the highest blocks nearest a certain point.  Highest block is considered before close-ness.
    * @param {Point} starting point to search outward from.
    * @param {Object} params Optional parameters:
    *      radius - how far to look.  defaults to 128.
    *      block_type(block_type) - function that returns if the block should be considered for destroying
    *      count - how many blocks to look for.  defaults to Infinity
    *      top_threshold - Only look at blocks below this height.  defaults to 128.
    *      bottom_threshold - Only look at blocks above this height.  defaults to 0.
    * @returns {Array} An array of mf.Point.  The location of between 0 to count nearest blocks.
    */    
    _public.findHighest = function(point, params) {
        if (point === undefined) {
            mf.debug("block_finder.findHighest given undefined point.");
            return [];
        }
        if (params.count === 0) {
            return [];
        }
        if (params.highest_count === 0) {
            return [];
        }
        var radius = params.radius;
        if (radius === undefined) {
            radius = 128;
        }
        var block_type = params.block_type;
        if (block_type === undefined) {
            block_type = function(block_type) {
                return block_type !== mf.ItemType.Air;
            }
        }
        var count = params.count;
        if (count === undefined) {
            count = Infinity;
        }
        var top_threshold = params.top_threshold;
        if (top_threshold === undefined) {
            top_threshold = 128;
        }
        var bottom_threshold = params.bottom_threshold;
        if (bottom_threshold === undefined) {
            bottom_threshold = 0;
        }
        var matches = [];
        var check_point = function(x, y, z) {
            if (block_type(mf.blockAt(new mf.Point(x,y,z)).type)) {
                matches.push(new mf.Point(x,y,z));
            }
            if (matches.length >= count) {
                return matches;
            }
        };
        for (var z = top_threshold; z >= bottom_threshold; z--) {
            for (var r = 0; r <= radius; r++) {
                var x = point.x - r;
                for (var y = point.y-r; y < point.y+r; y++) {
                    check_point(x,y,z);
                }
                var y = point.y + r;
                for (var x = point.x-r; x < point.x+r; x++) {
                    check_point(x,y,z);
                }
                var x = point.x + r;
                for (var y = point.y+r; y > point.y-r; y--) {
                    check_point(x,y,z);
                }
                var y = point.y - r;
                for (var x = point.x+r; x > point.x-r; x--) {
                    check_point(x,y,z);
                }
            }
        }
        return matches;
    }

    return _public;
}();
