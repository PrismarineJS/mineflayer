var auto_respawn;
if (auto_respawn === undefined) {
    auto_respawn = function() {
        var _public = {};
        _public.enabled = true;
        mf.onDeath(function() {
            if (_public.enabled) {
                mf.respawn();
            }
        });
        return _public;
    }();
}

