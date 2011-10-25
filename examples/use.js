mf.include("block_finder.js");
mf.include("items.js");
mf.include("navigator.js");
mf.include("chat_commands.js");
mf.include("task_manager.js");

(function() {
    chat_commands.registerCommand("use", function use(speaker, args, responder_fun) {
        var current_task = task_manager.doLater(new task_manager.Task(function use_block() {
            var matching_block = items.findBlockTypeUnambiguously(args.join(" "), responder_fun);
            if (matching_block === undefined) {
                return;
            }
            var block_position = block_finder.findNearest(mf.self().position, matching_block.id).shift();
            if (block_position === undefined) {
                responder_fun("I couldn't find any " + args.join(" "));
                return;
            }
            

            navigator.navigateTo(block_position,{
                end_radius: 3,
                timeout_milliseconds: 6 * 1000,
                cant_find_func: function() {
                    responder_fun("I couldn't find a path to the " + args.join(" ") + " at " + block_position.floored());
                    task_manager.done();
                },
                arrived_func: function() {
                    responder_fun("Using " + args.join(" ") + ".");
                    mf.hax.activateBlock(block_position);
                    task_manager.done();
                }
            });
        }, function stop() {
            if (inventory.currentlyOpenWindow !== undefined) {
                mf.closeWindow();
            }
        }, "use " + args.join(" ")));
    }, 1, Infinity);
})();
