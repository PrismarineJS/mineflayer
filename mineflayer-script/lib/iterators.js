mf.include("assert.js");

/**
 * Iterable:
 *     iterator() - returns an iterator
 *     toArray() - if present, returns an array containing all the elements
 * Iterator:
 *     hasNext() - returns whether there's another element
 *     next() - returns the next element
 */
var iterators = {};

/**
 * zig-zags.
 * 
 * v>v>v>v>v  \
 * v^v^v^v^v  |- stripe_width = 3
 * >^>^>^>^v  /
 * v<v<v<v<v
 * v^v^v^v^v
 * x^<^<^<^<
 *
 */
iterators.StripeIterable = function(params) {
    assert.classIs(params.corner1, mf.Point);
    var min = params.corner1.clone();
    assert.classIs(params.corner2, mf.Point);
    var max = params.corner2.clone();

    var y_direction = params.y_direction;
    assert.isTrue(y_direction === 1 || y_direction === -1);
    var stripe_width = params.stripe_width;
    assert.isNumber(stripe_width);
    assert.isTrue(stripe_width >= 1);

    function swap(a, b, property_name) {
        var tmp = a[property_name];
        a[property_name] = b[property_name];
        b[property_name] = tmp;
    }
    var coordinate_names = ["x", "y", "z"];
    for (var i = 0; i < coordinate_names.length; i++) {
        if (min[coordinate_names[i]] > max[coordinate_names[i]]) {
            swap(min, max, coordinate_names[i]);
        }
    }
    var major_coordinate_name = "x";
    var minor_coordinate_name = "z";
    if (max.x - min.x < max.z - min.z) {
        major_coordinate_name = "z";
        minor_coordinate_name = "x";
    }
    var start = min;
    var end = max;
    if (params.start_nearest !== undefined) {
        assert.classIs(params.start_nearest, mf.Point);
        // make sure start is the corner closest to start_nearest
        for (var i = 0; i < coordinate_names.length; i++) {
            var coordinate_name = coordinate_names[i];
            if (Math.abs(params.start_nearest[coordinate_name] - start[coordinate_name]) >
                Math.abs(params.start_nearest[coordinate_name] - end[coordinate_name])) {
                swap(start, end, coordinate_name);
            }
        }
    }
    // y direction overrides nearest point check
    if (start.y * y_direction > end.y * y_direction) {
        swap(start, end, "y");
    }

    var points = [];
    var stripe_endpoints = [start[minor_coordinate_name], end[minor_coordinate_name]];
    var stripe_direction = stripe_endpoints[0] < stripe_endpoints[1] ? 1 : -1;
    var major_endpoints = [start[major_coordinate_name], end[major_coordinate_name]];
    var major_direction = major_endpoints[0] < major_endpoints[1] ? 1 : -1;
    for (var y = start.y; y * y_direction <= end.y * y_direction; y += y_direction) {
        for (var stripe = stripe_endpoints[0]; stripe * stripe_direction <= stripe_endpoints[1] * stripe_direction; stripe += stripe_direction * stripe_width) {
            var minor_endpoints = [stripe, stripe + (stripe_width - 1) * stripe_direction];
            if (minor_endpoints[1] * stripe_direction > stripe_endpoints[1] * stripe_direction) {
                // overshot
                minor_endpoints[1] = stripe_endpoints[1];
            }
            var minor_direction = stripe_direction;
            for (var major = major_endpoints[0]; major * major_direction <= major_endpoints[1] * major_direction; major += major_direction) {
                for (var minor = minor_endpoints[0]; minor * minor_direction <= minor_endpoints[1] * minor_direction; minor += minor_direction) {
                    var point = new mf.Point(0, y, 0);
                    point[major_coordinate_name] = major;
                    point[minor_coordinate_name] = minor;
                    points.push(point);
                }
                minor_endpoints.reverse();
                minor_direction *= -1;
            }
            major_endpoints.reverse();
            major_direction *= -1;
        }
        stripe_endpoints.reverse();
        stripe_direction *= -1;
    }
    this.points = points;
};
iterators.StripeIterable.prototype.toArray = function() {
    return this.points.clone();
};
iterators.StripeIterable.prototype.iterator = function() {
    var points = this.points;
    var i = 0;
    return {
        hasNext: function() {
            return i < points.length;
        },
        next: function() {
            return points[i++];
        },
    };
};

