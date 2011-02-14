var player_tracker;

if (player_tracker === undefined) {
    player_tracker = function() {
        var _public = {};
        _public.debug = true;

        // check if we want to print messages before actually doing it
        function debug(message) {
            if (_public.debug)
                mf.debug(message)
        }

        var username_to_entity_id = {};
        mf.onEntitySpawned(function(entity) {
            if (entity.type !== mf.EntityType.Player) {
               return;
            }
            debug(entity.username+" logged in");
            username_to_entity_id[entity.username] = entity.entity_id;
        });
        mf.onEntityDespawned(function(entity) {
            if (entity.type !== mf.EntityType.Player) {
               return;
            }
            debug(entity.username+" logged out");
            delete username_to_entity_id[entity.username];
        });

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
        
        return _public;
   }();
}