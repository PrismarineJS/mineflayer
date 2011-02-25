mf.include("navigator.js");
mf.include("player_tracker.js");
mf.include("chat_commands.js");

var follower = function() {
    var _public = {};
    _public.enabled = true;
    _public.debug = true;
    chat_commands.registerModule("follower",_public);
    var followee = undefined;
    var following = false;
    
    var follow = function(username,args) {
        if (! _public.enabled) {
            mf.debug("follow command issued, but follower module not enabled");
            return;
        }
        var playerName = args[0] == "me" ? username : args[0];
        var player = player_tracker.entityForPlayer(player_tracker.findUsername(playerName));
        if (player == undefined) {
            mf.chat("I don't know who " + playerName + " is, or where they are.");
            mf.debug("I don't know who " + playerName + " is, or where they are.");
            return;
        }
        followee = player;
        mf.chat("I'm now following " + followee.username + ".");
    };
    mf.onEntityMoved(function(entity) {
        if (followee != undefined && ! following) {
            if (entity.entity_id == followee.entity_id) {
                following = true;
                navigator.navigateTo(entity.position, {
                    timeout_milliseconds: 3000,
                    end_radius: 12,
                    cant_find_func: function() { mf.chat("Can't get to you, " + entity.username + "!  I'm gonna stop following you!"); followee = undefined; following = false;},
                    arrived_func: function() {following = false;},
                });
            }
        }
    });
    
    chat_commands.registerCommand("follow",follow, 1, 1);
    return _public;
}();
