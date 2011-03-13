
mf.include("strings.js");

var player_tracker = {};
(function() {
    player_tracker.entityForPlayer = function(username) {
        var entity_id = username_to_entity_id[username];
        if (entity_id === undefined) {
           return undefined;
        }
        return mf.entity(entity_id);
    };
    player_tracker.allPlayers = function() {
        var player_names = [];
        for (var name in username_to_entity_id) {
            if (username_to_entity_id.hasOwnProperty(name)) {
                player_names.push(name);
            }
        }
        return player_names;
    };
    
    player_tracker.findUsername = function(name, speaker) {
        if (speaker !== undefined) {
            // pronouns only applicable when speaker is provided
            if (name === "me" || name === "myself") {
                return [speaker];
            }
            if (name === "you" || name === "yourself") {
                return [mf.self().username];
            }
        }
        var matches = [];
        var comparators = [
            function(s1, s2) { return s1.toLowerCase() === s2.toLowerCase(); },
            function(s1, s2) { return s1.toLowerCase().startsWith(s2.toLowerCase()); },
            function(s1, s2) { return s1.toLowerCase().contains(s2.toLowerCase()); },
        ];
        function filter_using_comparator(messyName, comparator) {
            var matches = [];
            var usernames = player_tracker.allPlayers();
            
            for (var i = 0; i < usernames.length; i++) {
                if (comparator(usernames[i], messyName)) {
                    matches.push(usernames[i]);
                }
            }
            return matches;
        }
        for (var i = 0; i < comparators.length; i++) {
            matches = filter_using_comparator(name, comparators[i]);
            if (matches.length != 0) {
                return matches;
            }
        }
        return [];
    };
    player_tracker.findUsernameUnambiguously = function(name, speaker, responder_func) {
        var matches = player_tracker.findUsername(name, speaker);
        if (matches.length === 0) {
            responder_func("can't see anybody named " + name);
            return undefined;
        }
        if (matches.length !== 1) {
            responder_func("name is ambiguous: " + matches.join(", "));
            return undefined;
        }
        return matches[0];
    };
    player_tracker.findUserEntityUnambiguously = function(name, speaker, responder_func) {
        var name = player_tracker.findUsernameUnambiguously(name, speaker, responder_func);
        if (name === undefined) {
            return undefined;
        }
        return player_tracker.entityForPlayer(name);
    };

    var username_to_entity_id = {};
    mf.onSpawn(function() {
        username_to_entity_id[mf.self().username] = mf.self().entity_id;
    });
    mf.onEntitySpawned(function(entity) {
        if (entity.type !== mf.EntityType.Player) {
           return;
        }
        username_to_entity_id[entity.username] = entity.entity_id;
    });
    mf.onEntityDespawned(function(entity) {
        if (entity.type !== mf.EntityType.Player) {
           return;
        }
        delete username_to_entity_id[entity.username];
    });
})();
