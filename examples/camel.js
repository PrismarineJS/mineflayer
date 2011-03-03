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
//                for (var j = 0; j < dumpSlots[i].count; j++) {
                    mf.clickOutsideWindow(mf.MouseButton.Right);    
  //              }
                mf.clickInventorySlot(dumpSlots[i].slot,mf.MouseButton.Left);
            }
        }
        dumpSlots = [];
        mf.closeWindow();
    });
    
    var dump = function(username,args,respond) {
        debugger;
        if ( args.length === 0 || args.length === 1 && (args[0] === "all" || args[0] === "inventory" || args[0] === "*" || args[0] === "everything")) {
            for (var i = 0; i < inventory.slot_count; i++) {
                dumpSlots.push({slot: i, count: "*"});
            }
            respond("Dumping everything!");
            mf.openInventoryWindow();
        } else if (args.length >= 1) {
            var itemCount = undefined;
            if (!isNaN(args[0])) {
                itemCount = args.shift();
                respond("Sorry, right-click giving one item at a time is currently broken.");
                return;
            }
            var itemName = args.join(" ");
            var itemType = items.lookupItemType(itemName);
            if (itemType.length === 0) {
                respond("The block '" + itemName + "' is ambiguous.");
                return;
            }
            var typeIndex = -1;
            if (itemType.length === 1) {
                typeIndex = 0;
            } else {
                for (var i = 0; i < itemType.length; i++) {
                    if (itemType[i].name.toLowerCase() === itemName.toLowerCase()) {
                        typeIndex = i;
                        break;
                    }
                }
            }
            if (typeIndex === -1) {
                var matchingItemTypeList = itemType;
                respond("The block '" + itemName + "' is ambiguous.");
                var matchingTypes = [];
                for (var i = 0; i < matchingItemTypeList.length; i++) {
                    matchingTypes.push(matchingItemTypeList[i].name);
                }
                respond("Did you mean any of these?: " + matchingTypes.join(", "));
                return false;
            } else {
                type = itemType[typeIndex].id;
                if (type === -1) {
                    respond("I don't understand '" + itemName + "'.");
                    return false;
                }
                
                if (inventory.itemSlot(type) === undefined) {
                    respond("I don't have any " + items.nameForId(type) + ".");
                    return;
                }
                if (itemCount === undefined) {
                    respond("Dumping all " + items.nameForId(type) + ".");
                } else {
                    respond("Dumping " + itemCount + " " + items.nameForId(type) + ".");
                }
                for (var i = 0; i < inventory.slot_count; i++) {
                    if (mf.inventoryItem(i).type === parseInt(type)) {
                        if (itemCount === undefined) {
                            dumpSlots.push({slot: i, count: "*"});
                        } else if (itemCount >= mf.inventoryItem(i).count) {
                            dumpSlots.push({slot: i, count: "*"});
                            itemCount = itemCount - mf.inventoryItem(i).count;
                        } else {
                            dumpSlots.push({slot: i, count: itemCount});
                            break;
                        }
                    }
                }
                mf.openInventoryWindow();
            }
        }
    };
    chat_commands.registerCommand("dump",dump,0,Infinity);
})();
