mf.include("chat_commands.js");
mf.include("task_manager.js");
mf.include("inventory.js");
mf.include("items.js");
mf.include("block_finder.js");
mf.include("navigator.js");

(function() {
    chat_commands.registerCommand("cook", function(speaker, args, responder_func) {
        if (args[0] === "bacon") {
            cook_bacon(responder_func);
        }
    }, 1);
    function cook_bacon(responder_func) {
        var raw_count = inventory.itemCount(mf.ItemType.RawPorkchop);
        var coal_count = inventory.itemCount(mf.ItemType.Coal);
        var missing_items = [];
        if (raw_count === 0) {
            missing_items.push(mf.ItemType.RawPorkchop);
        }
        if (coal_count === 0) {
            missing_items.push(mf.ItemType.Coal);
        }
        if (missing_items.length !== 0) {
            responder_func("don't have any " + missing_items.mapped(function(id) { return items.nameForId(id); }).join(" or "));
            return;
        }
        var furnace_position;
        var checker_inverval_id;
        function stop() {
            if (checker_inverval_id === undefined) {
                return;
            }
            mf.clearInterval(checker_inverval_id);
            checker_inverval_id = undefined;
            mf.closeWindow();
        }
        function checkTheStove() {
            if (checker_inverval_id === undefined) {
                return;
            }
            var input_slot = 0, fuel_slot = 1, output_slot = 2;
            var current_fuel = mf.uniqueWindowItem(fuel_slot);
            if (current_fuel.type === -1) {
                // place fuel
                var my_coal_slot = inventory.itemSlot(mf.ItemType.Coal);
                if (my_coal_slot !== undefined) {
                    var my_coal = mf.inventoryItem(my_coal_slot);
                    mf.clickInventorySlot(my_coal_slot, mf.MouseButton.Left);
                    mf.clickUniqueSlot(fuel_slot, mf.MouseButton.Right);
                    if (my_coal.count !== 1) {
                        mf.clickInventorySlot(my_coal_slot, mf.MouseButton.Left);
                    }
                }
            }

            var current_output = mf.uniqueWindowItem(output_slot);
            if (current_output.type !== -1) {
                // grab the output
                mf.clickUniqueSlot(output_slot, mf.MouseButton.Left);
                var empty_slot = inventory.firstEmptySlot();
                if (empty_slot !== undefined) {
                    mf.clickInventorySlot(empty_slot, mf.MouseButton.Left);
                } else {
                    // just throw it on the ground
                    mf.clickOutsideWindow(mf.MouseButton.Left);
                }
            }

            var current_input = mf.uniqueWindowItem(input_slot);
            if (current_input.type === -1) {
                // add bacon
                var my_bacon_slot = inventory.itemSlot(mf.ItemType.RawPorkchop);
                if (my_bacon_slot !== undefined) {
                    mf.clickInventorySlot(my_bacon_slot, mf.MouseButton.Left);
                    mf.clickUniqueSlot(input_slot, mf.MouseButton.Left);
                } else {
                    // out of bacon and nothing's cooking.
                    responder_func("done cooking bacon");
                    task_manager.done();
                    stop();
                }
            }
        }
        task_manager.doLater(new task_manager.Task(function start() {
            if (furnace_position === undefined) {
                responder_func("looking for a furnace");
                var radius = 30;
                var furnaces = block_finder.findNearest(mf.self().position, [mf.ItemType.Furnace, mf.ItemType.BurningFurnace], radius);
                if (furnaces.length === 0) {
                    responder_func("no furnaces within " + radius + " meters");
                    task_manager.done();
                    return;
                }
                responder_func("found a furnace");
                furnace_position = furnaces[0];
            }
            navigator.navigateTo(furnace_position, {
                "end_radius": 4,
                "cant_find_func": function() {
                    responder_func("can't get to the nearest furnace");
                    task_manager.done();
                },
                "arrived_func": function() {
                    mf.onWindowOpened(function handle_window_opend(window_type) {
                        mf.removeHandler(mf.onWindowOpened, handle_window_opend);
                        checker_inverval_id = mf.setInterval(checkTheStove, 100);
                    });
                    mf.lookAt(furnace_position);
                    mf.hax.activateBlock(furnace_position);
                },
            });
        }, stop, "cook bacon"));
    }
})();
