
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

var planar_neighbors = function(xy) {
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
};
var euclidean_distance = function(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy);
};
var rectilinear_distance = function(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.abs(dx) + Math.abs(dy);
};

/**
 * A simple 2-d test with 8 neighbors per cell.
 * Solution is a diagonal line directly from size,size to 0,0.
 */
function test_plane(size) {
    var end = [0, 0];
    var path = path_finder.findPath({
        "start": [size, size],
        "end": end,
        "equator_func": function(a, b) { return a.equals(b); },
        "neighbor_func": planar_neighbors,
        "distance_func": euclidean_distance,
        "heuristic_func": function(xy) {
            return rectilinear_distance(xy, end);
        },
    });
    for (var i = size; i >= 0; i--) {
        assert.isTrue(path.shift().equals([i, i]));
    }
}
test_plane(5);
test_plane(50);

/**
 * Tests navigating a maze.
 * @param maze Array of strings. '#' is wall, 's' is start, 'e' is end, anything else is floor. Maze must be bordered by '#' signs.
 * @param node_count The number of nodes in the answer including the start and the end, or undefined if the maze is impossible.
 */
function test_maze(maze, node_count) {
    // find the start and end positions
    var start;
    for (var y = 0; y < maze.length; y++) {
        var start_x = maze[y].indexOf("s");
        if (start_x !== -1) {
            start = [start_x, y];
            break;
        }
    }
    assert.isTrue(start !== undefined);
    var end;
    for (y = 0; y < maze.length; y++) {
        var end_x = maze[y].indexOf("e");
        if (end_x !== -1) {
            end = [end_x, y];
            break;
        }
    }
    assert.isTrue(end !== undefined);

    var path = path_finder.findPath({
        "start": start,
        "end": end,
        "equator_func": function(a, b) { return a.equals(b); },
        "neighbor_func": function(xy) {
            return planar_neighbors(xy).filtered(function(xy) {
                // cell is walkable if it's not a "#" sign
                return maze[xy[1]].charAt(xy[0]) !== "#";
            });
        },
        "distance_func": euclidean_distance,
        "heuristic_func": function(xy) {
            return euclidean_distance(xy, end);
        },
    });
    if (node_count !== undefined) {
        assert.isTrue(path.length === node_count);
    } else {
        assert.isTrue(path === undefined);
    }
}
test_maze([
    "###########",
    "# #       #",
    "#e# s ## ##",
    "# #       #",
    "# ## #### #",
    "#         #",
    "###########",
], 8);
test_maze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#         #",
    "###########",
], 16);
test_maze([
    "###########",
    "#e#   s   #",
    "# #   ## ##",
    "# #       #",
    "# ####### #",
    "#     #   #",
    "###########",
], undefined);

// every 10 cells (including start) is marked by a digit
test_maze([
    "##################################################################",
    "# #    2          #           ######## ######## # # ## #    # # ##",
    "# #### #### # ########## ############# #        # # ## #    # # ##",
    "#         # #          # #             ######## # # ## #    # # ##",
    "# # ####### ### ######## #############        # # # ## #    # # ##",
    "# #    # #    #  3            ######## ######## # #              #",
    "# # # ## ## ### ####### # #####        ########## ########### ####",
    "# ### #   # # # ####### # ############ #                 8  # # ##",
    "### # # #            ## #4           # ########## # # ## # ## # ##",
    "#s# # ################# # ############ ##       # # # ## # ## # ##",
    "# # 1           #       # #               #######7# # ## # ## #  #",
    "# # # ##### ## ######## # ############ ## #       # # ## #e## #  #",
    "# # ###   # #         # #       5      ##6####### ########### #  #",
    "# # # # #   ## ######## ##  ########## ##                        #",
    "#   # # ###### #        #       ######### # ################# ## #",
    "# # #        # ######## ##  #####         #                 # ## #",
    "##################################################################",
], 84);

mf.exit();
