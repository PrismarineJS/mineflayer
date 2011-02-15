
mf.include("assert.js");
mf.include("path_finder.js");
mf.include("arrays.js");

/**
 * Simplest example I could think of without being completely trivial.
 * Start at 5 and find a path to 0 along a number line.
 * The solution is [5, 4, 3, 2, 1, 0].
 */
function test_linear() {
    var path = path_finder.findPath({
        "start": 5,
        "end": 0,
        "equator_func": function(a, b) { return a === b; },
        "neighbor_func": function(x) { return [x - 1, x + 1]; },
        "distance_func": function(a, b) { return 1; },
        "heuristic_func": function(x) { return x; },
    });
    assert.isTrue(path.equals([5, 4, 3, 2, 1, 0]));
}
test_linear();

/**
 * Now a simple 2-d test with 8 neighbors per cell.
 * Solution is a diagonal line directly from 5,5 to 0,0.
 */
function test_plane() {
    debugger;
    var path = path_finder.findPath({
        "start": [5, 5],
        "end": [0, 0],
        "equator_func": function(a, b) { return a.equals(b); },
        "neighbor_func": function(xy) {
            var x = xy[0], y = xy[1];
            return [
                [x - 1, y - 1],
                [x - 1, y + 0],
                [x - 1, y + 1],
                [x + 0, y - 1],

                [x + 0, y + 1],
                [x + 1, y - 1],
                [x + 1, y + 0],
                [x + 1, y + 1],
            ];
        },
        "distance_func": function(a, b) {
            // use exact euclidean distance for programmatic simplicity
            var dx = b[0] - a[0], dy = b[1] - a[1];
            return Math.sqrt(dx * dx + dy * dy);
        },
        "heuristic_func": function(xy) {
            // use rectilinear distance for the heuristic
            return Math.abs(xy[0]) + Math.abs(xy[1]);
        },
    });
    for (var i = 5; i >= 0; i--) {
        assert.isTrue(path.shift().equals([i, i]));
    }
}
test_plane();

mf.exit();
