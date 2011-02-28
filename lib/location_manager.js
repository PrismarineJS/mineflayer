mf.include("player_tracker.js");
mf.include("json.js");

var location_manager = {};

(function() {
    location_manager.searchLocations = function(name) {
        function filter_using_comparator(name, comparator) {
            var matches = [];
            var all_locations = location_manager.allLocations();
            for (var i = 0; i < all_locations.length; i++) {
                if (comparator(all_locations[i].name, name)) {
                    matches.push(all_locations[i]);
                }
            }
            return matches;
        }
        var comparators = [
            function(s1, s2) { return s1 === s2; },
            function(s1, s2) { return s1.startsWith(s2); },
            function(s1, s2) { return s1.contains(s2); },
            // and then case-insensitive (for usernames)
            function(s1, s2) { return s1.toLowerCase() === s2.toLowerCase(); },
            function(s1, s2) { return s1.toLowerCase().startsWith(s2.toLowerCase()); },
            function(s1, s2) { return s1.toLowerCase().contains(s2.toLowerCase()); },
        ];
        var matches;
        for (var i = 0; i < comparators.length; i++) {
            matches = filter_using_comparator(name, comparators[i]);
            if (matches.length !== 0) {
                break;
            }
        }
        return matches;
    };
    location_manager.findUnambiguousLocation = function(location_name, responder_func) {
        var search_results = location_manager.searchLocations(location_name);
        if (search_results.length === 0) {
            responder_func("no point by that name");
            return undefined;
        } else if (search_results.length > 1) {
            responder_func("point name is ambiguous: " + search_results.mapped(function(l) { return l.name; }).join(" "));
            return undefined;
        }
        return search_results[0];
    };
    location_manager.allLocations = function() {
        var locations = [];
        for (var name in name_to_location) {
            locations.push(name_to_location[name]);
        }
        var usernames = player_tracker.allPlayers();
        for (var i = 0; i < usernames.length; i++) {
            var username = usernames[i];
            var entity = player_tracker.entityForPlayer(username);
            locations.push({"name": username, "point": entity.position});
        }
        return locations;
    };

    function hereis(username, args, responder_func) {
        var name = args[0];
        var entity = player_tracker.entityForPlayer(username);
        if (entity === undefined) {
            responder_func("sorry, can't see user: " + username);
            return;
        }
        var point = entity.position;
        var old_location = name_to_location[name];
        name_to_location[name] = {"point": point, "name": name},
        save_database();
        var created_or_updated;
        if (old_location === undefined) {
            created_or_updated = "created";
        } else {
            created_or_updated = "updated";
        }
        message = ["location", name, created_or_updated, "at", point].join(" ");
        responder_func(message);
    };
    chat_commands.registerCommand("hereis", hereis, 1);

    function forget(username, args, responder_func) {
        var name = args[0];
        var old_location = name_to_location[name];
        delete name_to_location[name];
        save_database();
        if (old_location !== undefined) {
            responder_func("point deleted. was at " + old_location.point);
        } else {
            responder_func("no point by that name");
        }
    };
    chat_commands.registerCommand("forget", forget, 1);

    var name_to_location;
    var database_file_name = "locations.json";
    function save_database() {
        mf.writeFile(database_file_name, json.stringify(name_to_location));
    }
    function load_database() {
        var database_contents = mf.readFile(database_file_name);
        if (database_contents !== undefined) {
            name_to_location = json.parse(database_contents);
        } else {
            mf.chat("no locations database found. i will create a new one in this directory.");
            name_to_location = {};
        }
    }
    load_database();

    chat_commands.registerCommand("reload", function(username, args, responder_func) {
        if (args[0] === "locations") {
            load_database();
        }
    }, 1);
    chat_commands.registerCommand("save", function(username, args, responder_func) {
        if (args[0] === "locations") {
            save_database();
        }
    }, 1);
})();
