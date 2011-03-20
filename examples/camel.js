mf.include("inventory.js");
mf.include("chat_commands.js");
mf.include("items.js");

(function() {
    var dropSlots = [];
    
    mf.onWindowOpened(function(window_type) {
        if (window_type !== mf.WindowType.Inventory) {
            return;
        }
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
        dropSlots = [];
        mf.closeWindow();
    });
    
    var drop = function(username,args,respond) {
        if ( args.length === 0 || args.length === 1 && (args[0] === "all" || args[0] === "inventory" || args[0] === "*" || args[0] === "everything")) {
            for (var i = 0; i < inventory.slot_count; i++) {
                dropSlots.push({slot: i, count: "*"});
            }
            respond("Dropping everything!");
            var player = player_tracker.entityForPlayer(username);
            if (player !== undefined) {
                var position = player.position;
                mf.lookAt(position);
            }
            mf.openInventoryWindow();
        } else if (args.length >= 1) {
            var item_count = undefined;
            if (!isNaN(args[0])) {
                item_count = args.shift();
            }
            var item_name = args.join(" ");

            var current_inventory = inventory.snapshot();
            // only look in our inventory
            var item = items.findUnambiguouslyInDatabase(item_name,respond,inventory.getDatabase());
            if (item === undefined) {
                return;
            }
            if (item_count === undefined) {
                respond("Dropping all " + item.name + ".");
            } else {
                respond("Dropping " + item_count + " " + item.name + ".");
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
            var player = player_tracker.entityForPlayer(username);
            if (player !== undefined) {
                var position = player.position;
                mf.lookAt(position);
            }
            mf.openInventoryWindow();
        }
    };

    var list = function(username,args,respond) {
        current_inventory = inventory.condensedSnapshot();
        more_respond = [];
        for (var type in current_inventory) {
            more_respond.push(current_inventory[type] + " " + items.nameForId(type));
        }
        respond("My Inventory: " + more_respond.join(", "));
    };

    chat_commands.registerCommand("list",list,0,0);
    chat_commands.registerCommand("drop",drop,0,Infinity);
})();
