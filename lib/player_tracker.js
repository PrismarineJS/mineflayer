
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
    
    player_tracker.findUsername = function(sloppyName) {
        var matches = [];
        var comparators = [
            function(s1, s2) {return s1.toLowerCase() === s2.toLowerCase();},
            function(s1, s2) { return s1.toLowerCase().startsWith(s2.toLowerCase());},
            function(s1, s2) { return s1.toLowerCase().contains(s2.toLowerCase());},
        ];
        function filter_using_comparator(messyName,comparator) {
            var matches = [];
            var usernames = player_tracker.allPlayers();
            
            for (var i=0; i < usernames.length; i++) {
                if (comparator(usernames[i],messyName)) {
                    matches.push(usernames[i]);
                }
            }
            return matches;
        }
        for (var i = 0; i < comparators.length; i++) {
            matches = filter_using_comparator(sloppyName,comparators[i]);
            if (matches.length != 0) {
                return matches;
            }
                
        }
        return [];
    };
    player_tracker.resolveUserEntityUnambiguously = function(name, speaker, responder_func) {
        if (name === "me" || name === "myself") {
            name = speaker;
        }
        if (name === "you" || name === "yourself") {
            return mf.self();
        }
        var results = player_tracker.findUsername(name);
        if (results.length === 0) {
            responder_func("can't see anyone named " + name);
            return undefined;
        }
        if (results.length === 1) {
            return player_tracker.entityForPlayer(results[0]);
        }
        responder_func("name is ambiguous: " + results.join(" "));
        return undefined;
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
