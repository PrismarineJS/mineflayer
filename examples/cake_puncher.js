mf.include("block_finder.js");
mf.include("navigator.js");
mf.include("auto_respawn.js");
mf.include("items.js");
mf.include("chat_commands.js");
mf.include("navigator_3d.js");

var get_it;

function go() {
    // FIND CAKE
    mf.chat("looking for " + get_it.name);
    var cake_pos_arr = block_finder.findNearest(mf.self().position.floored(), get_it.id, 64, 1);
    if (cake_pos_arr.length === 0) {
        mf.chat("can't find " + get_it.name);
    } else {
        // STAND ON THE CAKE
        var cake_pos = cake_pos_arr[0];
        navigator.navigateTo(cake_pos.offset(0, 0, 1), {
            "end_radius": 1,
            "arrived_func": function() {
                // PUNCH THE CAKE
                mf.startDigging(cake_pos);
            },
        });
    }
}

mf.onStoppedDigging(function() {
    mf.chat("take THAT "+ get_it.name + "!!");

    go();
});

chat_commands.registerCommand("punch", function(username, args) {
    var ret = items.lookupItemType(args[0]);
    if (ret.length != 1) {
        mf.chat("what. " + ret.mapped(function(item){return item.name;}));
        return;
    }
    get_it = ret[0];
    go();
}, 1);
