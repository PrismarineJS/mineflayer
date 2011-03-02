/**
 * syntax:
 * gimme [<count>] <item name>
 * give <username> [<count>] <item name>
 *
 * <count> defaults to 1 and represents the number of stacks.
 * <item name> can have spaces. very loose matching is used to look it up.
 *
 * examples:
 * gimme dirt                   - gives you 64 dirt
 * gimme 3 diam swo             - gives you 3 diamond swords
 * give OtherGuy 36 feathers    - gives OtherGuy enough feathers to fill his inventory
 */

mf.include("chat_commands.js");

mf.include("connection_notice.js");

mf.include("strings.js");
mf.include("arrays.js");

(function() {
    function give(username, args, responder_func) {
        var target_user = args.shift();
        if (target_user === "me") {
            target_user = username;
        } else if (target_user === "yourself" || target_user === "you") {
            target_user = mf.self().username;
        }
        gimme(target_user, args, responder_func);
    }
    chat_commands.registerCommand("give", give, 2, Infinity);

    function gimme(username, args, responder_func) {
        var count = parseInt(args[0]);
        if (isNaN(count)) {
            // no count specified
            count = 1;
        } else {
            // count specified
            args.shift();
        }
        give_items(username, args.join(" "), count, responder_func);
    }
    chat_commands.registerCommand("gimme", gimme, 1, Infinity);

    function give_items(username, item_name, count, responder_func) {
        // check for kits
        var preview_name_parts = item_name.split(" ");
        var kits = {
            "tools": ["shovel", "pickaxe", "axe", "sword", "hoe"],
            "suit":  ["helmet", "chestplate", "leggings", "boots"],
        };
        for (var kit_name in kits) {
            if (preview_name_parts.remove(kit_name)) {
                item_name = preview_name_parts.join(" ");
                var kit_items = kits[kit_name];
                for (var i = 0; i < kit_items.length; i++) {
                    if (!give_items(username, item_name + " " + kit_items[i], count, responder_func)) {
                        return false;
                    }
                }
                return true;
            }
        }
        // no kits
        var result = items.findItemTypeUnambiguously(item_name, responder_func);
        if (result === undefined) {
            return false;
        }
        var command = "/give " + username + " " + result.id + " " + mf.itemStackHeight(item_id);
        for (var i = 0; i < count; i++) {
            mf.chat(command);
        }
        return true;
    }
})();

