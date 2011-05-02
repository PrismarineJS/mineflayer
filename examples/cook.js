mf.include("chat_commands.js");
mf.include("task_manager.js");
mf.include("inventory.js");
mf.include("items.js");
mf.include("block_finder.js");
mf.include("navigator.js");
mf.include("Set.js");

(function() {
    var known_smelting_map = {};
    known_smelting_map[mf.ItemType.IronOre] = mf.ItemType.IronIngot;
    known_smelting_map[mf.ItemType.GoldOre] = mf.ItemType.GoldIngot;
    known_smelting_map[mf.ItemType.Sand] = mf.ItemType.Glass;
    known_smelting_map[mf.ItemType.Cobblestone] = mf.ItemType.Stone;
    known_smelting_map[mf.ItemType.RawPorkchop] = mf.ItemType.CookedPorkchop;
    known_smelting_map[mf.ItemType.ClayBall] = mf.ItemType.ClayBrick;
    known_smelting_map[mf.ItemType.RawFish] = mf.ItemType.CookedFish;
    known_smelting_map[mf.ItemType.Wood] = mf.ItemType.Coal;
    known_smelting_map[mf.ItemType.Cactus] = mf.ItemType.InkSac;

    var id_to_input = {};
    (function() {
        for (var input_id in known_smelting_map) {
            input_id = parseInt(input_id);
            var output_id = known_smelting_map[input_id];
            id_to_input[input_id] = input_id;
            id_to_input[output_id] = input_id;
        }
    })();

    chat_commands.registerCommand("cook", function(speaker, args, responder_func) {
        var input_name = args.join(" ");
        if (input_name === "bacon") {
            input_name = items.nameForId(mf.ItemType.RawPorkchop);
        }
        var search_results = items.lookupItemType(input_name);
        if (search_results.length === 0) {
            responder_func("wtf is a " + input_name);
            return;
        }
        var unique_set = new Set();
        var smelting_results = search_results.mapped(function(result) {
            return id_to_input[result.id];
        }).filtered(function(id) {
            return id !== undefined && unique_set.add(id);
        });
        if (smelting_results.length === 0) {
            responder_func("can't cook: " + search_results.mapped(function(result) { return result.name; }).join(", "));
            return;
        }
        if (smelting_results.length !== 1) {
            responder_func("name is ambiguous: " + smelting_results.mapped(function(id) { return items.nameForId(id); }).join(", "));
            return;
        }
        cook_something(smelting_results[0], responder_func);
    }, 0, Infinity);
    function cook_something(input_id, responder_func) {
        var input_name = items.nameForId(input_id);
        var checker_inverval_id;
        function done() {
            stop();
            task_manager.done();
        }
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
            if (current_input.type !== input_id) {
                // add bacon
                var my_bacon_slot = inventory.itemSlot(input_id);
                if (my_bacon_slot !== undefined) {
                    mf.clickInventorySlot(my_bacon_slot, mf.MouseButton.Left);
                    mf.clickUniqueSlot(input_slot, mf.MouseButton.Left);
                    if (current_input.id !== -1) {
                        // throw whatever was in there on the ground
                        mf.clickOutsideWindow(mf.MouseButton.Left);
                    }
                } else {
                    // out of input and nothing's cooking.
                    responder_func("done cooking " + input_name);
                    done();
                }
            }

            var current_fuel = mf.uniqueWindowItem(fuel_slot);
            if (current_fuel.type !== mf.ItemType.Coal) {
                // place fuel
                var my_coal_slot = inventory.itemSlot(mf.ItemType.Coal);
                if (my_coal_slot !== undefined) {
                    var my_coal = mf.inventoryItem(my_coal_slot);
                    mf.clickInventorySlot(my_coal_slot, mf.MouseButton.Left);
                    mf.clickUniqueSlot(fuel_slot, mf.MouseButton.Right);
                    if (my_coal.count !== 1) {
                        mf.clickInventorySlot(my_coal_slot, mf.MouseButton.Left);
                        if (current_fuel.id !== -1) {
                            // throw whatever was in there on the ground
                            mf.clickOutsideWindow(mf.MouseButton.Left);
                        }
                    }
                } else {
                    responder_func("out of coal");
                    done();
                }
            }
        }
        var furnace_position;
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
                    if (inventory.itemSlot(input_id) !== undefined) {
                        responder_func("cooking " + input_name);
                    } else {
                        responder_func("i don't have any " + input_name);
                        task_manager.done();
                        return;
                    }
                    mf.onWindowOpened(function handle_window_opened(window_type) {
                        mf.removeHandler(mf.onWindowOpened, handle_window_opened);
                        checker_inverval_id = mf.setInterval(checkTheStove, 100);
                    });
                    mf.lookAt(furnace_position);
                    mf.hax.activateBlock(furnace_position);
                },
            });
        }, stop, "cook " + input_name));
    }
})();
