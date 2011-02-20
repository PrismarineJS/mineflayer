var block_finder;
if (block_finder === undefined) {
    block_finder = function() {
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
         * @param {mf.ItemType} item The item id of the block to look for.
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

            var result = [];
            if (mf.blockAt(point).type == item_id) {
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
                                if (mf.blockAt(abs_coords).type == item_id) {
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
            return [];
        }

        return _public;
    }();
}
