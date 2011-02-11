
var connection_notice;
if (connection_notice === undefined) {
    connection_notice = function() {
        var _public = {};
        _public.enabled = true;
        mf.onConnected(function() {
            if (_public.enabled) {
                mf.debug("connected");
            }
        });
        return _public;
    }();
};
