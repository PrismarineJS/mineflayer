
mf.include("navigator.js");
mf.include("block_finder.js");
mf.include("chat_commands.js");
mf.include("arrays.js");

var fire_fighter;
if (fire_fighter === undefined) {
    fire_fighter = function() {
        var _public = {};
        _public.fightFire = function() {
            mf.chat("looking for fire");
            var nearest_fire_position = block_finder.findNearest(mf.self().position, mf.ItemType.Fire);
            if (nearest_fire_position === undefined) {
                mf.chat("didn't find any fire");
                return;
            }
            mf.chat("found fire");
            function arrived() {
                var punch_these = [
                    nearest_fire_position.offset( 1,  0,  0),
                    nearest_fire_position.offset(-1,  0,  0),
                    nearest_fire_position.offset( 0,  1,  0),
                    nearest_fire_position.offset( 0, -1,  0),
                    nearest_fire_position.offset( 0,  0,  1),
                    nearest_fire_position.offset( 0,  0, -1),
                ].filtered(function(point) { return mf.isDiggable(mf.blockAt(point).type); });
                var i = 0;
                function punch_next(reason) {
                    if (i < punch_these.length) {
                        var punch_this = punch_these[i];
                        mf.lookAt(punch_this);
                        mf.startDigging(punch_this);
                        i++;
                    } else {
                        mf.chat("done");
                        mf.removeHandler(mf.onStoppedDigging, punch_next);
                    }
                }
                mf.onStoppedDigging(punch_next);
                punch_next();
            }
            var distance_to_fire = mf.self().position.distanceTo(nearest_fire_position);
            var give_up_threshold = distance_to_fire * distance_to_fire;
            navigator.navigateTo(nearest_fire_position, arrived, 5, give_up_threshold);
        };
        chat_commands.registerCommand("fightfire", _public.fightFire);
        return _public;
    }();
}

