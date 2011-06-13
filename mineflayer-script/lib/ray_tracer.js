
var ray_tracer = {};
ray_tracer.find_physical_from_player = function(from_player) {
    var cursor = from_player.position.offset(0, from_player.height, 0);
    var yaw = from_player.yaw, pitch = from_player.pitch;
    var vector_length = 0.03125;
    var x = -Math.sin(yaw) * Math.cos(pitch);
    var y = Math.sin(pitch);
    var z = -Math.cos(yaw) * Math.cos(pitch);
    var step_delta = new mf.Point(x * vector_length, y * vector_length, z * vector_length);
    for (var i = 0; i < 192; i++) {
        cursor = cursor.plus(step_delta);
        if (mf.isPhysical(mf.blockAt(cursor).type)) {
            return cursor.floored();
        }
    }
    return undefined;
};
