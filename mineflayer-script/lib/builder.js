mf.include("task_manager.js");
mf.include("inventory.js");
mf.include("items.js");
mf.include("navigator.js");

var builder = {};

builder.BlockSpec = function(point, block_or_is_block_acceptable_func, placement_choices, placement_description) {
    this.point = point;
    this.isBlockAcceptable = block_or_is_block_acceptable_func;
    assert.isFunction(this.isBlockAcceptable);
    this.placement_choices = placement_choices;
    assert.isArray(this.placement_choices);
    this.placement_description = placement_description;
    assert.isString(this.placement_description);
};

builder.ConstructionProject = function(next_group_func) {
    this.nextGroup = next_group_func;
    assert.isFunction(this.nextGroup);
    // TODO: these are currently ignored
    this.killSediments = true;
    this.killLiquids = true;
};

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
                mf.lookAt(point);
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
            } else if (missing_tools === undefined) {
                current_block_spec = undefined;
                callback();
                return;
            } else {
                tool_name = items.nameForId(missing_tools[0]);
            }
            responder_func("need a " + tool_name);
            done();
        }
    }
    function place(point, item, callback) {
        function doneEquipping() {
            navigateTo(point, function () {
                if (builder.placeEquippedBlock(point)) {
                    callback();
                } else {
                    responder_func("can't place block");
                    done();
                }
            });
        }
        // TODO: metadata
        return inventory.equipItem(item.type, doneEquipping);
    }
    var current_block_spec = undefined;
    function dealWithNextThing() {
        while (true) {
            if (!running) {
                return;
            }
            if (current_block_spec === undefined) {
                current_block_spec = getNextBlockSpec();
                if (current_block_spec === undefined) {
                    responder_func("done");
                    done();
                }
            }
            // check for liquids
            for (var i = 0; i < builder.cardinal_vectors.length; i++) {
                var neighbor_point = current_block_spec.point.plus(builder.cardinal_vectors[i]);
                if (items.isBlockLiquid(mf.blockAt(neighbor_point))) {
                    if (place(neighbor_point, new mf.Item(mf.ItemType.Dirt), dealWithNextThing)) {
                        return;
                    }
                    responder_func("out of dirt to block liquids");
                    done();
                    return;
                }
            }
            var current_block = mf.blockAt(current_block_spec.point);
            if (current_block_spec.isBlockAcceptable(current_block)) {
                // done with this block
                current_block_spec = undefined;
                continue;
            }
            if (mf.isDiggable(current_block.type)) {
                // we'll need to dig this.
                // check for falling stuff
                var above_point = current_block_spec.point.offset(0, 1, 0);
                var dig_callback = dealWithNextThing;
                if (items.blockFalls(mf.blockAt(above_point))) {
                    // there's falling stuff. figure out what we're going to do now, then bring it on.
                    var block_will_fall_here = current_block_spec.point;
                    while (!mf.isPhysical(mf.blockAt(block_will_fall_here.offset(0, -1, 0)).type)) {
                        block_will_fall_here = block_will_fall_here.offset(0, -1, 0);
                    }
                    var number_of_falling_blocks = 1;
                    while (items.blockFalls(mf.blockAt(current_block_spec.point.offset(0, number_of_falling_blocks, 0)))) {
                        number_of_falling_blocks++;
                    }
                    dig_callback = function() {
                        // wait a very short moment, then place a torch
                        mf.setTimeout(function() {
                            if (!place(block_will_fall_here, new mf.Item(mf.ItemType.Torch), function() {
                                // placed a torch. wait, and then remove it.
                                mf.setTimeout(function() {
                                    dig(block_will_fall_here, dealWithNextThing);
                                }, 250 * number_of_falling_blocks + 500);
                            })) {
                                // placing the torch failed. Keep digging the sediment where it lands.
                                (function digTheSand() {
                                    mf.setTimeout(function() {
                                        if (!items.blockFalls(mf.blockAt(block_will_fall_here))) {
                                            dealWithNextThing();
                                            return;
                                        }
                                        dig(block_will_fall_here, digTheSand);
                                    }, 1000);
                                })();
                            }
                        }, 200);
                    };
                }
                dig(current_block_spec.point, dig_callback);
                return;
            }
            // put the right thing here
            var placement_choices = current_block_spec.placement_choices;
            for (var i = 0; i < placement_choices.length; i++) {
                var item = placement_choices[i];
                if (place(current_block_spec.point, item, dealWithNextThing)) {
                    return;
                }
            }
            responder_func("out of " + current_block_spec.placement_description);
            done();
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

builder.cardinal_vectors = [
    new mf.Point( 1,  0,  0),
    new mf.Point(-1,  0,  0),
    new mf.Point( 0,  1,  0),
    new mf.Point( 0, -1,  0),
    new mf.Point( 0,  0,  1),
    new mf.Point( 0,  0, -1),
];

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
    for (var i = 0; i < faces.length; i++) {
        var other_point = point.plus(builder.cardinal_vectors[i]);
        if (mf.canPlaceBlock(other_point, faces[i])) {
            mf.hax.placeBlock(other_point, faces[i]);
            return true;
        }
    }
    return false;
}
