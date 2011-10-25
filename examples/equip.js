mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("items.js");

(function () {
    function equip(speaker, args, respond) {
        var item_name = args.join(" ");
        // only look in our inventory
        var item = items.findUnambiguouslyInDatabase(item_name, respond, inventory.getDatabase());
        if (item === undefined) {
            return;
        }
        var type = item.id;
        respond("Equipping " + items.nameForId(type) + ".");
        if (inventory.isItemArmor(type)) {
            inventory.equipArmor(type);
        } else {
            inventory.equipItem(type);
        }
    }
    chat_commands.registerCommand("equip", equip, 1, Infinity);
})();
