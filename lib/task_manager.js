mf.include("chat_commands.js");
mf.include("assert.js");
mf.include("arrays.js");

/**
 * Example:
 * var id;
 * task_manager.doLater(new task_manager.Task(function start() {
 *     id = mf.setIntevral(function() {
 *         mf.debug("hello");
 *     }, 1000);
 * }, function stop() {
 *     mf.clearInterval(id);
 * });
 *
 */
task_manager = {};

(function() {
    /**
     * Constructor.
     * @param start_func() called when the job starts or resumes
     * @param abort_func() called when the job should abort and never resume
     * @param pause_func() optional. called when the job should pause temporarilly. defaults to abort_func.
     */
    task_manager.Task = function(start_func, abort_func, pause_func) {
        assert.isFunction(start_func);
        this.start = start_func;
        assert.isFunction(abort_func);
        this.abort = abort_func;
        if (pause_func !== undefined) {
            assert.isFunction(pause_func);
            this.pause = pause_func;
        } else {
            this.pause = abort_func;
        }
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
        var result = false;
        if (tasks.remove(task)) {
            task.abort();
            result = true;
        }
        runNextCommand();
        return result;
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
