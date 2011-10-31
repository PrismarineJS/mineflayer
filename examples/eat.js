
mf.include("chat_commands.js");
mf.include("inventory.js");
mf.include("items.js");

(function() {
    function eat(args, responder_func, force) {
        var item_to_eat = undefined;
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
            var inv = inventory.condensedSnapshot();
            var choices = [];
            for (var item_type_str in inv) {
                var item_type = parseInt(item_type_str);
                var nutrition_from_item = items.nutrition_from_food(item_type);
                if (nutrition_from_item === undefined) {
                    continue; // not food
                }
                if (item_type === mf.ItemType.RottenFlesh ||
                    item_type === mf.ItemType.SpiderEye) {
                    continue; // no thanks
                }
                if (items.nameForId(item_type).startsWith("raw")) {
                    // let's not eat raw stuff
                    continue;
                }
                choices.push({"id": item_type, "value": nutrition_from_item});
            }
            if (choices.length === 0) {
                if (force) {
                    responder_func("don't have any food");
                }
                return;
            }
            choices.sort(function(left, right) {
                return left.value - right.value;
            });
            for (var i = choices.length - 1; i >= 0; i--) {
                if (choices[i].value <= nutrition_to_be_gained) {
                    item_to_eat = choices[i].id;
                    break;
                }
            }
            if (item_to_eat === undefined) {
                // only overkill is available
                var we_need_food = mf.healthStatus().health < 20 &&
                                   mf.healthStatus().food < 18;
                if (force || we_need_food) {
                    // eat the smallest overkill
                    item_to_eat = choices[0].id;
                }
            }
        }
        if (item_to_eat === undefined) {
            return;
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

