mf.include("strings.js");
mf.include("arrays.js");

var items = {};
(function() {
    items.nameForId = function(id) {
        var result = item_database[id];
        if (result === undefined) {
            result = block_database[id];
        }
        if (result === undefined) {
            return undefined;
        }
        return result;
    };
    items.armor = {};
    items.armor.helmets = [mf.ItemType.LeatherHelmet, mf.ItemType.IronHelmet, mf.ItemType.DiamondHelmet, mf.ItemType.ChainmailHelmet];
    items.armor.chestplates = [mf.ItemType.LeatherChestplate, mf.ItemType.IronChestplate, mf.ItemType.DiamondChestplate, mf.ItemType.ChainmailChestplate];
    items.armor.leggings = [mf.ItemType.LeatherLeggings, mf.ItemType.IronLeggings, mf.ItemType.DiamondLeggings, mf.ItemType.ChainmailLeggings];
    items.armor.boots = [mf.ItemType.LeatherBoots, mf.ItemType.IronBoots, mf.ItemType.DiamondBoots, mf.ItemType.ChainmailBoots];

    items.tools = {};
    items.tools.pickaxes = [mf.ItemType.WoodenPickaxe, mf.ItemType.StonePickaxe, mf.ItemType.IronPickaxe, mf.ItemType.GoldPickaxe];
    items.tools.shovels = [mf.ItemType.WoodenShovel, mf.ItemType.StoneShovel, mf.ItemType.IronShovel, mf.ItemType.GoldShovel];
    items.tools.axes = [mf.ItemType.WoodenAxe, mf.ItemType.StoneAxe, mf.ItemType.IronAxe, mf.ItemType.GoldAxe];
    items.tools.hoes = [mf.ItemType.WoodenHoe, mf.ItemType.StoneHoe, mf.ItemType.IronHoe, mf.ItemType.GoldHoe];
    items.tools.swords = [mf.ItemType.WoodenSword, mf.ItemType.StoneSword, mf.ItemType.IronSword, mf.ItemType.GoldSword];

    /**
     * Returns number of half-hearts the food specified heals for.
     * @param {Number} item_type
     * @return {Number} or undefined.
     */
    items.health_from_food = function(item_type) {
        return item_type_to_health[item_type];
    };
    var item_type_to_health = {};
    (function() {
        item_type_to_health[mf.ItemType.GoldenApple] = 20;
        item_type_to_health[mf.ItemType.MushroomStew] = 10;
        item_type_to_health[mf.ItemType.CookedPorkchop] = 8;
        item_type_to_health[mf.ItemType.Bread] = 5;
        item_type_to_health[mf.ItemType.CookedFish] = 5;
        item_type_to_health[mf.ItemType.Apple] = 4;
        item_type_to_health[mf.ItemType.RawPorkchop] = 3;
        item_type_to_health[mf.ItemType.RawFish] = 2;
    })();

    items.findItemTypeUnambiguously = function(name, responder_func) {
        return items.findUnambiguouslyInDatabase(name, responder_func, item_database);
    };
    items.findBlockTypeUnambiguously = function(name, responder_func) {
        return items.findUnambiguouslyInDatabase(name, responder_func, block_database);
    };
    items.findUnambiguouslyInDatabase = function(name, responder_func, database) {
        var results = items.lookupInDatabase(name, database);
        if (results.length === 0) {
            responder_func("name not found: " + name);
            return undefined;
        }
        if (results.length !== 1) {
            responder_func("name is ambiguous: " + results.mapped(function(result) { return result.name; }).join(", "));
            return undefined;
        }
        return results[0];
    };
    items.lookupItemType = function(name) {
        return items.lookupInDatabase(name, item_database);
    };
    items.lookupBlockType = function(name) {
        return items.lookupInDatabase(name, block_database);
    };
    items.lookupInDatabase = function(name, database) {
        function filter_using_comparator(name_parts, comparator) {
            var matches = [];

            // loop over all the items
            for (var item_id in database) {
                var existing_name_parts = database[item_id].split(" ");
                var found_all_name_parts = true;
                for (var j = 0; j < name_parts.length; j++) {
                    var item_name = name_parts[j];
                    var found_name = false;
                    for (var k = 0; k < existing_name_parts.length; k++) {
                        var existing_name = existing_name_parts[k];
                        if (comparator(existing_name, item_name)) {
                            found_name = true;
                            break;
                        }
                    }
                    if (!found_name) {
                        found_all_name_parts = false;
                        break;
                    }
                }
                if (found_all_name_parts) {
                    matches.push({"id":parseInt(item_id), "name":existing_name_parts.join(" ")});
                }
            }
            return matches;
        }
        function searchForNameParts(name_parts) {
            var comparators = [
                function(s1, s2) { return s1 === s2; },
                function(s1, s2) { return s1.startsWith(s2); },
                function(s1, s2) { return s1.contains(s2); },
            ];
            for (i = 0; i < comparators.length; i++) {
                var results = filter_using_comparator(name_parts, comparators[i]);
                if (results.length !== 0) {
                    return results;
                }
            }
            return [];
        }
        var name_parts = name.split(" ");
        var results = searchForNameParts(name_parts);
        if (results.length === 0) {
            // try stripping off any s to tolerate plurals
            var did_anything = false;
            for (var i = 0; i < name_parts.length; i++) {
                var part = name_parts[i];
                if (part.endsWith("s") && part.length > 1) {
                    part = part.substr(0, part.length - 1);
                    name_parts[i] = part;
                    did_anything = true;
                }
            }
            if (did_anything) {
                results = searchForNameParts(name_parts);
            }
        }
        var number_or_words_results = [];
        if (results.length > 1) {
            // try to resolve ambiguity by number of words
            for (i = 0; i < results.length; i++) {
                var result = results[i];
                if (result.name.split(" ").length === name_parts.length) {
                    number_or_words_results.push(result);
                }
            }
        }
        if (number_or_words_results.length === 1) {
            return number_or_words_results;
        }
        return results;
    };

    // internal database of item names {item_id:name,...}
    var item_database = {};
    // block database is only id's < 256 (and strip off the _placed from the name)
    var block_database = {};
    (function() {
        for (var formal_name in mf.ItemType) {
            var databases = [item_database];
            var id = mf.ItemType[formal_name];
            if (id < 256) {
                databases.push(block_database);
            }
            if (formal_name.endsWith("_placed")) {
                // block-specific. not an item.
                databases.remove(item_database);
                formal_name = formal_name.substr(0, formal_name.length - "_placed".length);
            }
            var new_name = formal_name.replace(/([A-Z])/g, " $1").trim().toLowerCase();
            for (var i = 0; i < databases.length; i++) {
                var database = databases[i];
                database[id] = new_name;
            }
        }
    })();
})();
