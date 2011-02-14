mf.include("chat_commands.js");
mf.include("player_tracker.js");

// TODO: find alternative paths

var walker;
if (walker === undefined) {
    walker = function() {
        var _public = {};
        _public.debug = true;
        var target_position, target_distance = 2, default_distance = 2;
        var last_position;
        chat_commands.registerModule("walker", _public);
        
        /**
         * Start walking to position
         * @param {Point} position Position the bot should walk to
         * @param {Number} distance How close to the target should the walk (2 appropriate when coming to a person)
         */
        _public.walkTo = function(position, distance) {
            target_position = position;
            target_distance = distance || default_distance;
            last_position = undefined;

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

        function debug(message) {
            if (_public.debug) {
                mf.debug(message);
            }
        }

        function respond(message) {
            debug(message)
            mf.chat(message);
        }
        
        // Simplify modifying a point
        mf.Point.prototype.modifyBy = function(modifier) {
            return new mf.Point(this.x+modifier.x, this.y+modifier.y, this.z+modifier.z);
        }
        
        // Distance calculation
        mf.Point.prototype.distanceTo = function(other_point) {
            return Math.sqrt(Math.pow(Math.abs(this.x-other_point.x), 2) + Math.pow(Math.abs(this.y-other_point.y), 2) + Math.pow(Math.abs(this.z-other_point.z), 2));
        }
        
        // Used for bad distance calculation
        mf.Point.prototype.difference = function(other_point) {
            return Math.abs(this.x-other_point.x) + Math.abs(this.y-other_point.y) + Math.abs(this.z-other_point.z);
        }
        
        // Faster? calculation to compare the distance
        mf.Point.prototype.distanceLessThan = function(other_point, distance) {
            return ((Math.pow(Math.abs(this.x-other_point.x), 2) + Math.pow(Math.abs(this.y-other_point.y), 2) + Math.pow(Math.abs(this.z-other_point.z), 2)) < Math.pow(distance, 2));
        }

        function jump() {
            mf.setControlState(mf.Control.Jump, true);
            mf.setTimeout(function() {
                mf.setControlState(mf.Control.Jump, false);
            }, 200);
        }
        
        function botMoved() {
            var me = mf.self()
            var my_pos = me.position;
            // See if we have arrived
            if (my_pos.distanceLessThan(target_position, target_distance)) {
                respond("I've arrived!");
                _public.stop()
            } else {
                // check if we are blocked and need to try to jump
                var yaw = me.yaw;
                var x = Math.cos(yaw)*0.6, y = Math.sin(yaw)*0.6;
                var forward_pos = my_pos.modifyBy({x:x, y:y, z:0});
                var block = mf.blockAt(forward_pos).type;
                if (block !== 0) {
                    jump();
                }

                // check that we are still moving
                if (last_position !== undefined && my_pos.difference(last_position) < 0.01) {
                    respond("I'm stuck!");
                    // mf.debug("Diff: "+my_pos.difference(last_position));
                    _public.stop();
                }
                last_position = my_pos;

                // var direction = ((Math.abs(x) > Math.abs(y)) && ((x>0) && "east" || "west") || ((y>0) && "north" || "south"));
                // mf.debug("heading mostly "+direction);

                debug("I'm now "+my_pos.distanceTo(target_position).toFixed(1)+"m away!");
            }
        }

        function comeToMe(username) {
            var entity = player_tracker.entityForPlayer(username);
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
