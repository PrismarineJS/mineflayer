mf.include("inventory.js");
mf.include("chat_commands.js");
mf.include("items.js");

(function() {
    var dumpSlots = [];
    
    mf.onWindowOpened(function(window_type) {
        if (window_type !== mf.WindowType.Inventory) {
            return;
        }
        for (var i = 0; i < dumpSlots.length; i++) {
            mf.clickInventorySlot(dumpSlots[i].slot,mf.MouseButton.Left);
            if (dumpSlots[i].count === "*") {
                mf.clickOutsideWindow(mf.MouseButton.Left);
            } else {
                for (var j = 0; j < dumpSlots[i].count; j++) {
                    mf.clickOutsideWindow(mf.MouseButton.Right);    
                }
                mf.clickInventorySlot(dumpSlots[i].slot,mf.MouseButton.Left);
            }
        }
        dumpSlots = [];
        mf.closeWindow();
    });
    
    var dump = function(username,args,respond) {
        if ( args.length === 0 || args.length === 1 && (args[0] === "all" || args[0] === "inventory" || args[0] === "*" || args[0] === "everything")) {
            for (var i = 0; i < inventory.slot_count; i++) {
                dumpSlots.push({slot: i, count: "*"});
            }
            respond("Dumping everything!");
            mf.openInventoryWindow();
        } else if (args.length >= 1) {
            var item_count = undefined;
            if (!isNaN(args[0])) {
                item_count = args.shift();
            }
            var item_name = args.join(" ");

            var inventory_database = {};
            var current_inventory = inventory.snapshot();
            for (var i = 0; i < current_inventory.length; i++) {
                inventory_database[current_inventory[i].type] = items.nameForId(current_inventory[i].type);
            }
            // only look in our inventory
            var results = items.lookupInDatabase(item_name, inventory_database);
            if (results.length !== 1) {
                // we don't have it or it's ambiguous
                if (results.length !== 0) {
                    respond(item_name + " is ambiguous: " + results.mapped(function(item) { return item.name; }).join(", "));
                    return;
                }
                // we don't have it. see if it exists in the global database.
                results = items.lookupItemType(item_name);
                if (results.length === 0) {
                    respond("I dont' know of anything named '" + item_name + "'.");
                    return;
                } else {
                    // it's an item we don't have.
                    respond("I don't have any of these: " + results.mapped(function(item) { return item.name; }).join(", "));
                    return;
                }
            }
            var item = results.shift();
            
            if (item_count === undefined) {
                respond("Dumping all " + item.name + ".");
            } else {
                respond("Dumping " + item_count + " " + item.name + ".");
            }
            
            for (var i = 0; i < current_inventory.length; i++) {
                if (current_inventory[i].type === parseInt(item.id)) {
                    if (item_count === undefined) {
                        dumpSlots.push({slot: i, count: "*"});
                    } else if (item_count >= current_inventory.counts[i]) {
                        dumpSlots.push({slot: i, count: "*"});
                        item_count = item_count - current_inventory[i].count;
                    } else {
                        dumpSlots.push({slot: i, count: item_count});
                        break;
                    }
                }
            }
            mf.openInventoryWindow();
        }
    };

    var list = function(username,args,respond) {
        current_inventory = inventory.condensedSnapshot();
        respond("My Inventory: ");
        more_respond = [];
        for (var type in current_inventory) {
            more_respond.push(items.nameForId(type) + " x " + current_inventory[type]);
        }
        respond(more_respond.join(", "));
    };

    chat_commands.registerCommand("list",list,0,0);
    chat_commands.registerCommand("dump",dump,0,Infinity);
})();
