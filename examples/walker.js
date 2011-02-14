mf.include("chat_commands.js");

// TODO: Jump up on blocks, find alternative paths

var walker;
if (walker === undefined) {
    walker = function() {
        var _public = {};
        _public.debug = true;
        var target_position, target_distance = 2, default_distance = 2;
        chat_commands.registerModule("walker", _public);
        
        /**
         * Start walking to position
         * @param {Point} position Position the bot should walk to
         * @param {Number} distance How close to the target should the walk (2 appropriate when coming to a person)
         */
        _public.walkTo = function(position, distance) {
            target_position = position;
            target_distance = distance || default_distance;

            // politely face the target's face
            // mf.lookAt(target_position.modifyBy(new mf.Point(0, 0, 1.6)));
            mf.lookAt(target_position);
            
            // register bot moved callback
            mf.onSelfMoved(botMoved);
            
            // move forward constantly
            mf.setControlState(mf.Control.Forward, true);
        }
        
        /**
         * Stop walking and stop listening to events
         */
        _public.stop = function() {
            // Stop walking
            mf.setControlState(mf.Control.Forward, false);
            // Remove callbacks
            mf.removeHandler(mf.onSelfMoved, botMoved);
        }

        function respond(message) {
            if (_public.debug) {
                mf.debug(message);
            }
            mf.chat(message);
        }
        
        // copied from teleporter
        // track user's entity_id's
        var username_to_entity_id = {};
        mf.onEntitySpawned(function(entity) {
            if (entity.type !== mf.EntityType.Player) {
                return;
            }
            mf.debug("i see " + entity.username);
            username_to_entity_id[entity.username] = entity.entity_id;
        });
        mf.onEntityDespawned(function(entity) {
            if (entity.type !== mf.EntityType.Player) {
                return;
            }
            mf.debug("i no longer see " + entity.username);
            delete username_to_entity_id[entity.username];
        });
        function namedEntity(username) {
            var entity_id = username_to_entity_id[username];
            if (entity_id === undefined) {
                return undefined;
            }
            return mf.entity(entity_id);
        }

        // Simplify modifying a point
        mf.Point.prototype.modifyBy = function(modifier) {
            return new mf.Point(this.x+modifier.x, this.y+modifier.y, this.z+modifier.z);
        }
        
        // Distance calculation
        mf.Point.prototype.distanceTo = function(other_point) {
            return Math.sqrt(Math.pow(Math.abs(this.x-other_point.x), 2) + Math.pow(Math.abs(this.y-other_point.y), 2) + Math.pow(Math.abs(this.z-other_point.z), 2));
        }
        
        // Faster? calculation to compare the distance
        mf.Point.prototype.distanceLessThan = function(other_point, distance) {
            return ((Math.pow(Math.abs(this.x-other_point.x), 2) + Math.pow(Math.abs(this.y-other_point.y), 2) + Math.pow(Math.abs(this.z-other_point.z), 2)) < Math.pow(distance, 2));
        }
        
        function botMoved() {
            var my_pos = mf.self().position;
            // See if we have arrived
            if (my_pos.distanceLessThan(target_position, target_distance)) {
                respond("I've arrived!");
                _public.stop()
            } else {
                mf.debug("I'm now "+my_pos.distanceTo(target_position).toFixed(1)+"m away!")
            }
        }

        function comeToMe(username) {
            var entity = namedEntity(username);
            if (entity === undefined) {
                respond("sorry, can't see user: " + username);
                return;
            }
            
            // save the target position
            respond("Coming to "+username+". distance is "+mf.self().position.distanceTo(entity.position).toFixed()+"m");
            _public.walkTo(entity.position)
        }
        chat_commands.registerCommand("come", comeToMe);
        chat_commands.registerCommand("stop", _public.stop);
                
        return _public;
    }();
}
