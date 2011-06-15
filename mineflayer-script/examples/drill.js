mf.include("chat_commands.js");
mf.include("player_tracker.js");

chat_commands.registerCommand("drill", function(speaker_name, args, responder_func) {
    var player_entity = player_tracker.entityForPlayer(speaker_name);
    if (player_entity === undefined) {
        responder_func("sorry, can't see you");
        return;
    }
    var starting_point = player_entity.position.floored();
    var yaw_round_size = Math.PI / 2; // 90 degrees
    var cardinal_yaw = Math.round(player_entity.yaw / yaw_round_size) % 4;
    var forward_vectors = [
        new mf.Point(0, 0, -1), // east
        new mf.Point(-1, 0, 0), // north
        new mf.Point(0, 0, 1), // west
        new mf.Point(1, 0, 0), // south
    ];
    var forward_vector = forward_vectors[cardinal_yaw];
    var left_vector = forward_vectors[(cardinal_yaw + 1) % 4];

    var construction_project = {};
    (function() {
        var cursor = starting_point;
        construction_project.nextGroup = function() {
            var result = [
                new builder.BlockSpec(cursor.offset(0, 1, 0), new mf.Item(mf.ItemType.Air)),
                new builder.BlockSpec(cursor,                 new mf.Item(mf.ItemType.Air)),
            ];
            cursor = cursor.add(forward_vector);
            return result;
        };
    })();

    builder.startBuilding(construction_project, "drill");
});

