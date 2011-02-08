/**
 * syntax:
 * gimme <item name> [<count>]
 * give <username> <item name> [<count>]
 *
 * <item name> can have spaces. very loose matching is used to look it up.
 * <count> defaults to 1 and represents the number of stacks.
 *
 * examples:
 * gimme dirt                   - gives you 64 dirt
 * gimme 3 diam swo             - gives you 3 diamond swords
 * give OtherGuy 36 feathers    - gives OtherGuy enough feathers to fill his inventory
 */

include("strings.js");

var giver = function() {
    var _public = {};
    _public.enabled = true;
    _public.debug = true;
    mf.onChat(function(username, message) {
        if (!_public.enabled) {
            return;
        }
        var parts = message.toLowerCase().trim().split(" ");
        var index = 0;
        var command = parts[index++];
        if (command === "gimme") {
            // target user is self
        } else if (command === "give") {
            // extract username
            var different_username = parts[index];
            if (different_username === undefined) return;
            different_username = different_username.toLowerCase();
            if (different_username !== "me") {
                different_username = lookupUser(different_username);
                if (different_username === undefined) {
                    mf.chat("can't find player: " + parts[index]);
                    return;
                }
                username = different_username;
            }
            index++;
        } else {
            return;
        }
        var count = parseInt(parts[index]);
        if (isNaN(count)) {
            // no count specified
            count = 1;
        } else {
            // count specified
            index++;
        }
        if (!(index < parts.length)) {
            return;
        }
        var item_name = parts.slice(index).join(" ");
        give(username, item_name, count);
    });
    function give(username, item_name, count) {
        var item_id_or_ambiguous_results = lookupItemType(item_name);
        if (typeof item_id_or_ambiguous_results === "number") {
            var item_id = item_id_or_ambiguous_results;
            if (item_id === -1) {
                mf.chat("can't find item name: " + item_name);
                return;
            }
            var command = "/give " + username + " " + item_id + " " + mf.itemStackHeight(item_id);
            if (_public.debug) {
                if (count === 1) {
                    mf.debug("sending: " + command);
                } else {
                    mf.debug("sending " + count + " times: " + command);
                }
            }
            for (var i = 0; i < count; i++) {
                mf.chat(command);
            }
        } else {
            var ambiguous_results = item_id_or_ambiguous_results;
            mf.chat("item name is ambiguous: " + item_name);
            var ambiguous_candidates = [];
            for (var i = 0; i < ambiguous_results.length; i++) {
                ambiguous_candidates.push(ambiguous_results[i][0].join(" "));
            }
            mf.chat("candidates: " + ambiguous_candidates.join(", "));
        }
    };

    function lookupUser(name) {
        // TODO
        return name;
    };
    function lookupItemType(item_name) {
        var item_name_parts = item_name.split(" ");
        // strip off any final 's' to tolerate plurals, sorta
        for (var i = 0; i < item_name_parts.length; i++) {
            if (item_name_parts[i].endsWith("s"))
                item_name_parts[i] = item_name_parts[i].substr(0, item_name_parts[i].length - 1);
        }
        function lookup_using_comparator(comparator) {
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
                return matches;
            }
            return better_matches[0][1];
        }
        var comparators = [
            function(s1, s2) { return s1 === s2;},
            function(s1, s2) { return s1.startsWith(s2);},
            function(s1, s2) { return s1.contains(s2);},
        ];
        for (i = 0; i < comparators.length; i++) {
            var result = lookup_using_comparator(comparators[i]);
            if (typeof result !== "number") {
                // ambiguous
                return result;
            }
            if (result >= 0) {
                // found
                return result;
            }
        }
        // not found
        return result;
    };
    var item_database = function() {
        function splitCamelCase(s) {
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
        };
        var item_database = [];
        for (var formal_name in mf.ItemType) {
            if (formal_name.contains("_")) {
                continue;
            }
            item_database.push([splitCamelCase(formal_name), mf.ItemType[formal_name]]);
        }
        return item_database;
    }();
    return _public;
}();


