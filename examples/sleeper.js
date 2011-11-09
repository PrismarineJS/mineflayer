mf.include("block_finder.js");
mf.include("navigator.js");
mf.include("task_manager.js");
mf.include("chat_commands.js");

(function() {
    var bed_type = 26;

    function block_is_good(block) {
        return (block.type === bed_type) && (block.isUnoccupied()) && (block.isHead());
    }

    chat_commands.registerCommand("sleep", function(speaker, args, responder_fun) {
        var current_task = task_manager.doLater(new task_manager.Task(function find_bed() {
            var block_positions = block_finder.findNearest(mf.self().position, block_is_good);

            if (block_positions.length === 0) {
                responder_fun("I couldn't find any beds!");
                // task_manager.done() ?
                return;
            }
            var block_position = block_positions.shift();
            navigator.navigateTo(block_position, {
                 end_radius: 3,
                 timeout_milliseconds: 6 * 1000,
                 cant_find_func: function() {
                    responder_fun("I can't get to the bed at " + block_position.floored());
                    task_manager.done();
                 },
                 arrived_func: function() {
                     if (mf.timeOfDay() < 600) {
                        responder_fun("It's not night time!");
                        task_manager.done();
                        return;
                     }
                     responder_fun("Zzzz");
                     mf.hax.activateBlock(block_position);
                     task_manager.done();
                 }
            });
        }, function stop() {
            
        }, "Go to sleep"));
    });
})();
