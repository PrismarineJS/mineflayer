
mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("items.js");

(function() {
    function eat(args, responder_func, force) {
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
            var nutrition_to_be_gained = 20 - mf.healthStatus().food;
            if (nutrition_to_be_gained === 0) {
                if (force) {
                    responder_func("already at full food");
                }
                return;
            }
            var overkill_choice;
            var efficient_choice;
            var inv = inventory.condensedSnapshot();
            for (var item_type_str in inv) {
                var item_type = parseInt(item_type_str);
                var nutrition_from_item = items.nutrition_from_food(item_type);
                if (nutrition_from_item === undefined) {
                    continue; // not food
                }
                if (nutrition_from_item > nutrition_to_be_gained) {
                    // overkill
                    if (overkill_choice !== undefined && items.nutrition_from_food(overkill_choice) < nutrition_from_item) {
                        continue; // not better
                    }
                    if (!force) {
                        // don't bother
                        continue;
                    }
                    overkill_choice = item_type;
                } else {
                    // efficient
                    if (efficient_choice !== undefined && items.nutrition_from_food(efficient_choice) > nutrition_from_item) {
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
                if (force) {
                    responder_func("don't have any food");
                }
                return;
            }
        }
        responder_func("eating " + items.nameForId(item_to_eat));
        inventory.equipItem(item_to_eat, function() {
            mf.activateItem();
        });
    }
    chat_commands.registerCommand("eat", function(speaker_name, args, responder_func) {
        eat(args, responder_func, true);
    }, 0, Infinity);

    var auto_eat_responder_func = undefined;
    chat_commands.registerCommand("autoeat", function(speaker_name, args, responder_func) {
        if (args[0] === "on") {
            responder_func("autoeat is now ON");
            auto_eat_responder_func = responder_func;
        } else {
            responder_func("autoeat is now OFF");
            auto_eat_responder_func = undefined;
        }
    }, 1);
    function checkAutoEat() {
        if (auto_eat_responder_func === undefined) {
            return;
        }
        eat([], auto_eat_responder_func, false);
    };
    mf.onHealthStatusChanged(checkAutoEat);
})();

