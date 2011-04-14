mf.include("chat_commands.js");

task_manager = {};

task_manager.Task = function(onStart, onStop) {
    this._type = "Task";
    this.onStart = onStart;
    this.onStop = onStop
};

(function() {
    tasks = [];

    run = function() {
        if (tasks.length === 0) {
            return;
        }
        tasks[0].onStart();
    };

    task_manager.add = function(task) {
        tasks.push(task);
        if (tasks.length === 1) {
            run();
        }
    };

    task_manager.remove = function(task) {
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i] === task) {
                tasks.splice(i,1);
                if (i === 0) {
                    if (task.onRemoved !== undefined) {
                        task.onRemoved();
                    }
                }
                break;
            }

        }
    };

    task_manager.doNow = function(task) {
        if (tasks.length > 0) {
            if (tasks[0].pause !== undefined) {
                tasks[0].pause();
            }
        }
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i] === task) {
                tasks.splice(i,1);
                break;
            }
        }
        tasks.unshift(task);
        run();
    };

    stop = function() {
        if (tasks.length === 0) {
            return;
        }
        task = tasks.shift();
        if (task.onRemove !== undefined) {
            task.onRemove();
        }
        tasks = [];
    };
            
    task_manager.getCurrentTask = function() {
        return tasks[0];
    };

    task_manager.isTaskScheduled = function(task) {
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i] === task) {
                return true;
            }
        }
        return false;
    };

    task_manager.taskCount = function() { return tasks.length; };
    chat_commands.registerCommand("stop",function() {
        if (tasks.length === 0) {
            return;
        }
        task = tasks.shift();
        if (task.onRemove !== undefined) {
            task.onRemove();
        }
        tasks = [];
    });
    chat_commands.registerCommand("tasks",function(speaker,args,responder_fun) {
        responder_fun("Tasks: " + tasks.join(", "));
    });
})();
