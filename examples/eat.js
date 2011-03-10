
mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("items.js");

(function() {

    function eat(speaker, args, responder_func) {
        var item_to_eat;
        if (args.length !== 0) {
            // eat specific food
            var item_name = args.join(" ");
            // only look in our inventory
            var item = items.findUnambiguouslyInDatabase(item_name, responder_func, inventory.getDatabase());
            if (item === undefined) {
                return;
            }
            item_to_eat = item.id;
        } else {
            // find the right food
            var health_to_be_gained = 20 - mf.health();
            if (health_to_be_gained === 0) {
                responder_func("already at full health");
                return;
            }
            var overkill_choice;
            var efficient_choice;
            var inv = inventory.condensedSnapshot();
            for (var item_type_str in inv) {
                var item_type = parseInt(item_type_str);
                var health_from_item = items.health_from_food(item_type);
                if (health_from_item === undefined) {
                    continue; // not food
                }
                if (health_from_item > health_to_be_gained) {
                    // overkill
                    if (overkill_choice !== undefined && items.health_from_food(overkill_choice) < health_from_item) {
                        continue; // not better
                    }
                    overkill_choice = item_type;
                } else {
                    // efficient
                    if (efficient_choice !== undefined && items.health_from_food(efficient_choice) > health_from_item) {
                        continue; // not better
                    }
                    efficient_choice = item_type;
                }
            }
            if (efficient_choice !== undefined) {
                item_to_eat = efficient_choice;
            } else if (overkill_choice !== undefined) {
                item_to_eat = overkill_choice;
            } else {
                responder_func("don't have any food");
                return;
            }
        }
        responder_func("eating " + items.nameForId(item_to_eat));
        inventory.equipItem(item_to_eat, function() {
            mf.activateItem();
        });
    }
    chat_commands.registerCommand("eat", eat, 0, Infinity);
})();

