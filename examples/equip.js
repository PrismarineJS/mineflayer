mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("items.js");

(function () {
    function equip(speaker, args, responder_func) {
        var item_name = args.join(" ");
        var inv = inventory.condensedSnapshot();
        // only look in our inventory
        var results = items.lookupInDatabase(item_name, inventory.getDatabase());
        if (results.length !== 1) {
            // we don't have it or it's ambiguous
            if (results.length !== 0) {
                responder_func("name is ambiguous: " + results.mapped(function(item) { return item.name; }).join(", "));
                return;
            }
            // we don't have it. see if it exists in the global databse.
            results = items.lookupItemType(item_name);
            if (results.length === 0) {
                responder_func("name not found");
            } else {
                // it's an item we don't have.
                responder_func("i don't have: " + results.mapped(function(item) { return item.name; }).join(", "));
            }
            return;
        }
        var type = results[0].id;
        responder_func("Equipping " + items.nameForId(type) + ".");
        if (inventory.isItemArmor(type)) {
            inventory.equipArmor(type);
        } else {
            inventory.equipItem(type);
        }
    }
    chat_commands.registerCommand("equip", equip, 1, Infinity);
})();
