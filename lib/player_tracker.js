mf.include("strings.js");

var player_tracker;

if (player_tracker === undefined) {
    player_tracker = function() {
        var _public = {};
        _public.entityForPlayer = function(username) {
            var entity_id = username_to_entity_id[username];
            if (entity_id === undefined) {
               return undefined;
            }
            return mf.entity(entity_id);
        }
        
        _public.allPlayers = function() {
            var player_names = [];
            for (var name in username_to_entity_id) {
                if (username_to_entity_id.hasOwnProperty(name)) {
                    player_names.push(name);
                }
            }
            return player_names;
        }
        
        _public.findUsername = function(sloppyName) {
            var matches = [];
            var comparators = [
                function(s1, s2) {return s1.toLowerCase() === s2.toLowerCase();},
                function(s1, s2) { return s1.startsWith(s2);},
                function(s1, s2) { return s1.contains(s2);},
            ];
            function filter_using_comparator(messyName,comparator) {
                var matches = [];
                usernames = _public.allPlayers();
                
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
             
        }

        var username_to_entity_id = {};
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

        return _public;
   }();
}
