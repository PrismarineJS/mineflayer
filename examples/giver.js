/**
 * syntax:
 * give <item name> [<count>]
 *
 * <item name> can have spaces. very loose matching is used to look it up.
 * <count> defaults to 1 and represents the number of stacks.
 *
 * examples:
 * give dirt        - gives 64 dirt
 * give dim swo 3   - gives 3 diamond swords
 */

function MineflayerBot() {
    this.item_database = this.initCache();
}

MineflayerBot.prototype.onChat = function(username, message) {
    command = message.toLowerCase();
    var parts = command.trim().split(" ");
    if (parts.length < 2 || parts[0] !== "give") {
        return;
    }
    var name_end = parts.length;
    var count = parseInt(parts[parts.length - 1]);
    if (isNaN(count)) {
        // no count specified
        count = 1;
    } else {
        // count specified
        name_end--;
    }
    var item_name = parts.slice(1, name_end).join(" ");
    this.give(username, item_name, count);
}
MineflayerBot.prototype.give = function(username, item_name, count) {
    var item_id = this.lookupItemType(item_name);
    if (item_id === -1) {
        mf.chat("can't find item name: " + item_name);
        return;
    } else if (item_id === -2) {
        mf.chat("item name is ambiguous: " + item_name);
        return;
    }
    for (var i = 0; i < count; i++) {
        mf.chat("/give " + username + " " + item_id + " " + mf.itemStackHeight(item_id));
    }
}

MineflayerBot.prototype.initCache = function() {
    var item_database = [];
    for (var formal_name in mf.ItemType) {
        item_database.push([this.splitCamelCase(formal_name), mf.ItemType[formal_name]]);
    }
    return item_database;
}
MineflayerBot.prototype.lookupItemType = function(item_name) {
    var item_name_parts = item_name.split(" ");
    function lookup_using_comparator(item_database, comparator) {
        var matches = [];
        for (var i = 0; i < item_database.length; i++) {
            var entry = item_database[i];
            var existing_name_parts = entry[0];
            var item_id = entry[1];
            var found_all_item_name_parts = true;
            for (var j = 0; j < item_name_parts.length; j++) {
                var item_name = item_name_parts[j];
                var found_item_name = false;
                for (var k = 0; k < existing_name_parts.length; k++) {
                    var existing_name = existing_name_parts[k];
                    if (comparator(existing_name, item_name)) {
                        found_item_name = true;
                        break;
                    }
                }
                if (!found_item_name) {
                    found_all_item_name_parts = false;
                    break;
                }
            }
            if (found_all_item_name_parts) {
                matches.push(entry);
            }
        }
        if (matches.length === 0) {
            // not found
            return -1;
        } else if (matches.length === 1) {
            // found exactly
            return matches[0][1];
        }
        // ambiguous. try to resolve.
        var better_matches = [];
        for (i = 0; i < matches.length; i++) {
            entry = matches[i];
            if (entry[0].length === item_name_parts.length) {
                better_matches.push(entry);
            }
        }
        if (better_matches.length !== 1) {
            // unable to resolve ambiguity
            return -2;
        }
        return better_matches[0][1];
    }
    var result
    // try to find matches with startsWith()
    result = lookup_using_comparator(this.item_database, function(s1, s2) { return s1 === s2;});
    if (result >= 0 || result === -2) {
        // found or ambiguous
        return result;
    }
    // not found yet
    // try to find matches with startsWith()
    result = lookup_using_comparator(this.item_database, function(s1, s2) { return s1.startsWith(s2);});
    if (result >= 0 || result === -2) {
        // found or ambiguous
        return result;
    }
    // not found yet
    // try to find contains() matches
    return lookup_using_comparator(this.item_database, function(s1, s2) { return s1.contains(s2);});
}
MineflayerBot.prototype.splitCamelCase = function(s) {
    if (s.length === 0) {
        return [];
    }
    var result = [];
    var word_start = 0;
    // ignore case of first letter
    for (var i = 1; i < s.length; i++) {
        var c = s.charAt(i);
        if (c === c.toUpperCase()) {
            result.push(s.substr(word_start, i).toLowerCase());
            word_start = i;
        }
    }
    result.push(s.substr(word_start).toLowerCase());
    return result;
}

String.prototype.contains = function(s) {
    return this.indexOf(s) !== -1;
}
String.prototype.startsWith = function(s) {
    return this.lastIndexOf(s, 0) === 0;
}
/**
 * only trims spaces, not tabs or newlines or anything else.
 */
String.prototype.trim = function() {
    var start = 0, end = this.length;
    while (start < end && this.charAt(start) === " ") {
        start++;
    }
    while (start < end && this.charAt(end - 1) === " ") {
        end--;
    }
    return this.substr(start, end);
}
