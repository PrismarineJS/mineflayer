mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("items.js");

(function () {
    function equip(username, args, respond) {
        var itemName = args.join(" ");
        var itemType = items.lookupItemType(itemName);
        if (itemType.length === 0) {
            respond("item type not found: " + itemName);
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
            respond("The block '" + itemName +"' is ambiguous.");
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
            respond("Equipping " + items.nameForId(type) + ".");
            inventory.equipItem(type);
        }
        
    }
    chat_commands.registerCommand("equip",equip,1,Infinity);
})();
