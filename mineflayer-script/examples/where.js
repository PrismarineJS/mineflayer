mf.include("chat_commands.js");
mf.include("player_tracker.js");
mf.include("location_manager.js");

(function() {
    function whereAreYou(speaker, args, responder_func) {
        responder_func("I am at " + mf.self().position.floored());
    };
    chat_commands.registerCommand("whereareyou", whereAreYou);

    function whereIs(speaker, args, responder_func) {
        var location = location_manager.findUnambiguousLocation(args.join(" "), responder_func);
        if (location === undefined) {
            return;
        }
        var absolute_position = location.point.floored();
        var player = player_tracker.entityForPlayer(speaker);
        if (player !== undefined) {
            // absolute and relative
            var speaker_position = player.position.floored();
            var relative_position = absolute_position.minus(speaker_position);
            responder_func(location.name + " is at " + absolute_position + " which is " + relative_position + " from you");
        } else {
            // can't see speaker. just give relative position.
            responder_func(location.name + " is at " + absolute_position);
        }
    };
    chat_commands.registerCommand("whereis", whereIs, 1, Infinity);
})();

