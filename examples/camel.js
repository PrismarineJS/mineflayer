mf.include("inventory.js");
mf.include("task_manager.js");
mf.include("chat_commands.js");
mf.include("items.js");

(function() {
    

    chat_commands.registerCommand("drop", function(username, args, responder_func) {
        var dropSlots = [];
        var respond_message;
        if (args.length === 0 || args.length === 1 && (args[0] === "all" || args[0] === "inventory" || args[0] === "*" || args[0] === "everything")) {
            for (var i = 0; i < inventory.slot_count; i++) {
                dropSlots.push({slot: i, count: "*"});
            }
            respond_message = "Dropping everything!";
        } else if (args.length >= 1) {
            var item_count = undefined;
            if (!isNaN(args[0])) {
                item_count = args.shift();
            }
            var item_name = args.join(" ");

            var current_inventory = inventory.snapshot();
            // only look in our inventory
            var item = items.findUnambiguouslyInDatabase(item_name, responder_func, inventory.getDatabase());
            if (item === undefined) {
                return;
            }
            if (item_count === undefined) {
                respond_message = "Dropping all " + item.name + ".";
            } else {
                respond_message = "Dropping " + item_count + " " + item.name + ".";
            }
            
            for (var i = 0; i < current_inventory.length; i++) {
                if (current_inventory[i].type === parseInt(item.id)) {
                    if (item_count === undefined) {
                        dropSlots.push({slot: i, count: "*"});
                    } else if (item_count >= current_inventory[i].count) {
                        dropSlots.push({slot: i, count: "*"});
                        item_count = item_count - current_inventory[i].count;
                    } else {
                        dropSlots.push({slot: i, count: item_count});
                        break;
                    }
                }
            }
        }
        task_manager.doNow(new task_manager.Task(function start() {
            responder_func(respond_message);
            var player = player_tracker.entityForPlayer(username);
            if (player !== undefined) {
                var position = player.position;
                mf.lookAt(position, true);
            }
            mf.onWindowOpened(function asdf(window_type) {
                if (window_type !== mf.WindowType.Inventory) {
                    return;
                }
                mf.removeHandler(mf.onWindowOpened, asdf);
                for (var i = 0; i < dropSlots.length; i++) {
                    mf.clickInventorySlot(dropSlots[i].slot,mf.MouseButton.Left);
                    if (dropSlots[i].count === "*") {
                        mf.clickOutsideWindow(mf.MouseButton.Left);
                    } else {
                        for (var j = 0; j < dropSlots[i].count; j++) {
                            mf.clickOutsideWindow(mf.MouseButton.Right);
                        }
                        mf.clickInventorySlot(dropSlots[i].slot,mf.MouseButton.Left);
                    }
                }
                mf.closeWindow();
                task_manager.done();
            });
            mf.openInventoryWindow();
        }, function stop() {
            // can't stop
        }, respond_message));
    }, 0, Infinity);

    chat_commands.registerCommand("list", function(speaker_name, args, responder_func) {
        var name_filter = args[0];
        if (name_filter === undefined) {
            name_filter = "";
        }
        var current_inventory = inventory.condensedSnapshot();
        current_inventory[-1] = inventory.slotsLeft();
        var result = [];
        for (var type in current_inventory) {
            var name = type !== "-1" ? items.nameForId(type) : "empty slots";
            if (name.contains(name_filter)) {
                result.push(current_inventory[type] + " " + name);
            }
        }
        if (result.length !== 0) {
            responder_func(result.join(", "));
        } else {
            responder_func("i have nothing matching \"" + name_filter + "\"");
        }
    }, 0, 1);
})();
