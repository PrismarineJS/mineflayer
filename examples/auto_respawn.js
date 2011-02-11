
var auto_respawn;
if (auto_respawn === undefined) {
    auto_respawn = function() {
        var _public = {};
        _public.enabled = true;
        _public.debug = true;
        mf.onDeath(function() {
            if (_public.enabled) {
                if (_public.enabled) {
                    mf.debug("respawning");
                }
                mf.respawn();
            }
        });
        return _public;
    }();
}

