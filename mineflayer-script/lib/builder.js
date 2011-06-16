mf.include("task_manager.js");
mf.include("inventory.js");
mf.include("items.js");
mf.include("navigator.js");

var builder = {};

builder.BlockSpec = function(point, block) {
    this.point = point;
    this.block = block;
}

builder.startBuilding = function(construction_project, task_name, responder_func) {
    var current_buffer = [];
    function getNextBlockSpec() {
        while (current_buffer.length === 0) {
            current_buffer = construction_project.nextGroup();
            if (current_buffer === undefined) {
                return undefined;
            }
        }
        return current_buffer.shift();
    }
    function navigateTo(point, arrived_func) {
        navigator.navigateTo(point, {
            "end_radius": 4,
            "arrived_func": arrived_func,
            "cant_find_func": function() {
                responder_func("can't navigate");
                done();
            },
        });
    }
    function dig(point, callback) {
        function doneEquipping() {
            navigateTo(point, function() {
                mf.onStoppedDigging(function asdf(reason) {
                    mf.removeHandler(mf.onStoppedDigging, asdf);
                    if (reason === mf.StoppedDiggingReason.BlockBroken) {
                        callback();
                    }
                });
                mf.startDigging(point);
            });
        }
        var block_type = mf.blockAt(point).type;
        if (!inventory.equipBestTool(block_type, doneEquipping)) {
            var missing_tools = items.toolsForBlock(block_type);
            var tool_name;
            if (missing_tools === items.tools.shovels) {
                tool_name = "shovel";
            } else if (missing_tools === items.tools.pickaxes) {
                tool_name = "pick";
            } else  if (missing_tools === items.tools.axes) {
                tool_name = "axe";
            } else {
                tool_name = items.nameForId(missing_tools[0]);
            }
            responder_func("need a " + tool_name);
            done();
        }
    }
    function place(point, block) {
        // TODO: metadata
        function doneEquipping() {
            navigateTo(point, function () {
                if (builder.placeEquippedBlock(point)) {
                    dealWithNextThing();
                } else {
                    responder_func("can't place block");
                    done();
                }
            });
        }
        if (!inventory.equipItem(block.type, doneEquipping)) {
            responder_func("out of " + items.nameForId(block.type));
            done();
        }
    }
    var current_block_spec = undefined;
    function dealWithNextThing() {
        while (true) {
            if (!running) {
                return;
            }
            if (current_block_spec === undefined) {
                current_block_spec = getNextBlockSpec();
            }
            var current_block = mf.blockAt(current_block_spec.point);
            if (current_block.equals(current_block_spec.block)) {
                // done with this block
                current_block_spec = undefined;
                continue;
            }
            if (current_block.type !== mf.ItemType.Air) {
                // get this outta the way
                dig(current_block_spec.point, dealWithNextThing);
                return;
            }
            // put the right thing here
            place(current_block_spec.point, current_block_spec.block, dealWithNextThing);
            return;
        }
    }
    var running;
    function start() {
        running = true;
        responder_func("drilling");
        dealWithNextThing();
    }
    function done() {
        stop();
        task_manager.done();
    }
    function stop() {
        running = false;
        mf.stopDigging();
        navigator.stop();
    }
    task_manager.doLater(new task_manager.Task(start, stop, task_name));
};

builder.placeEquippedBlock = function(point) {
    // try placing on any face that will work
    var faces = [
        mf.Face.NegativeX,
        mf.Face.PositiveX,
        mf.Face.NegativeY,
        mf.Face.PositiveY,
        mf.Face.NegativeZ,
        mf.Face.PositiveZ,
    ];
    var vectors = [
        new mf.Point( 1,  0,  0),
        new mf.Point(-1,  0,  0),
        new mf.Point( 0,  1,  0),
        new mf.Point( 0, -1,  0),
        new mf.Point( 0,  0,  1),
        new mf.Point( 0,  0, -1),
    ];
    for (var i = 0; i < faces.length; i++) {
        var other_point = point.plus(vectors[i]);
        if (mf.canPlaceBlock(other_point, faces[i])) {
            mf.hax.placeBlock(other_point, faces[i]);
            return true;
        }
    }
    return false;
}
