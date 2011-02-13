var items = function() {
    var _public = {};
    _public.debug = false;
    
    // check if we want to print messages before actually doing it
    function debug(message) {
        if (_public.debug)
            mf.debug(message)
    }

    // internal database of item names {item_id:name,...}
    var item_database = function() {
        var item_database = {};
        for (var formal_name in mf.ItemType) {
            if (formal_name.contains("_")) {
                continue;
            }
            var new_name = formal_name.replace(/([A-Z])/g, " $1").trim().toLowerCase().split(" ");
            item_database[mf.ItemType[formal_name]] = new_name;
        }
        return item_database;
    }();

    /**
     * Gets a printable name for a item_id
     * @param {Number} id The item ID of the item to get the name for.
     * @returns {String} Name of the item or undefined. 
     */
    _public.nameForId = function(id) {
        return item_database[id].join(" ");
    }
    
    /**
     * Find the id of a named type, including partial matches if no one can be found.
     * If a perfect match or only a single match was found, the numeric id will be returned.
     * @param {String} item_name Full or partial name of a type to get the id for.
     * @returns {Array} Array of [{id:, name:}] or []. 
     */
    _public.lookupItemType = function(item_name) {
        // strip of any s at the end for plural
        if (item_name.endsWith("s"))
            item_name = item_name.substr(0, item_name.length - 1);
            
        debug("Searching for: "+item_name);
        var item_name_parts = item_name.split(" ");
        
        function filter_using_comparator(item_name_parts, comparator) {
            var matches = [];

            // loop over all the items
            for (var item_id in item_database) {
                var existing_name_parts = item_database[item_id];
                // debug("Comparing "+existing_name_parts+" to "+item_name_parts)
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
                    matches.push({"id":item_id, "name":existing_name_parts});
                }
            }

            if (matches.length < 2) {
                // not found or exact match
                return matches;
            }

            // ambiguous. try to resolve.
            var better_matches = [];
            for (i = 0; i < matches.length; i++) {
                entry = matches[i];
                if (entry.name.length === item_name_parts.length) {
                    better_matches.push(entry);
                }
            }
            if (better_matches.length !== 1) {
                // unable to resolve ambiguity
                return matches;
            }
            return better_matches;
        }

        var comparators = [
            function(s1, s2) { return s1 === s2;},
            function(s1, s2) { return s1.startsWith(s2);},
            function(s1, s2) { return s1.contains(s2);},
        ];

        for (i = 0; i < comparators.length; i++) {
            debug("Using comparator: "+comparators[i]);
            result = filter_using_comparator(item_name_parts, comparators[i]);
            debug("Result.length: "+result.length);
            if (result.length > 0) {
                for (var i in result) {
                    result[i].name = result[i].name.join(" ");
                }
                return result;
            }
        }

        // not found
        return [];
    }

    return _public;
}();
