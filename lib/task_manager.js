mf.include("chat_commands.js");
mf.include("assert.js");
mf.include("arrays.js");

task_manager = {};

(function() {
    task_manager.Task = function(start_func, abort_func) {
        assert.isFunction(start_func);
        this.start = start_func;
        assert.isFunction(abort_func);
        this.abort = abort_func;
        this.pause = abort_func;
    };
    tasks = [];

    function runNextCommand() {
        if (tasks.length === 0) {
            return;
        }
        tasks[0].start();
    };

    task_manager.doLater = function(task) {
        tasks.push(task);
        if (tasks.length === 1) {
            runNextCommand();
        }
    };
    task_manager.doNow = function(task) {
        if (tasks.length !== 0) {
            tasks[0].pause();
        }
        tasks.remove(task);
        tasks.unshift(task);
        runNextCommand();
    };

    task_manager.remove = function(task) {
        assert.isTrue(tasks.remove(task));
        task.abort();
        runNextCommand();
    };

    chat_commands.registerCommand("stop", function() {
        if (tasks.length === 0) {
            return;
        }
        tasks[0].abort();
        tasks = [];
    });
    chat_commands.registerCommand("tasks",function(speaker,args,responder_fun) {
        responder_fun("Tasks: " + tasks.join(", "));
    });
})();
