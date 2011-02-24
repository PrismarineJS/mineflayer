mf.include("assert.js");

var chat_commands = function() {
    var _public = {};
    _public.enabled = true;
    _public.registerModule = function(module_name, module) {
        assert.isString(module_name);
        assert.isObject(module);
        assert.isTrue(modules_by_name[module_name] === undefined);
        modules_by_name[module_name] = module;
    };
    _public.registerCommand = function(command_name, callback, min_arg_count, max_arg_count) {
        assert.isTrue(commands_by_name[command_name] === undefined);
        assert.isString(command_name);
        assert.isFunction(callback);
        if (min_arg_count === undefined) {
            min_arg_count = 0;
        }
        assert.isNumber(min_arg_count);
        if (max_arg_count === undefined) {
            max_arg_count = min_arg_count;
        }
        assert.isNumber(max_arg_count);

        var entry = {};
        entry.command_name = command_name;
        entry.callback = callback;
        entry.min_arg_count = min_arg_count;
        entry.max_arg_count = max_arg_count;
        commands_by_name[command_name] = entry;
    };

    var modules_by_name = {};
    var commands_by_name = {};
    function respond(message) {
        mf.chat(message);
    }

    mf.onChat(function(username, message) {
        if (!_public.enabled) {
            return;
        }
        handle_chat(username, message);
    });
    function handle_chat(username, message) {
        var parts = message.toLowerCase().trim().split(" ");
        if (parts.length === 0) {
            return;
        }
        var command_name = parts.shift();
        var entry = commands_by_name[command_name];
        if (entry === undefined) {
            return;
        }
        if (!(entry.min_arg_count <= parts.length && parts.length <= entry.max_arg_count)) {
            // ignore wrong usage
            respond("wrong number of args for command: " + command_name);
            return;
        }
        entry.callback(username, parts);
    }

    // install builtin commands

    _public.registerModule("chat_commands", _public);

    var property_value_string_to_actual_value = {
        "true": true,
        "on": true,
        "false": false,
        "off": false,
    };
    function set(username, parts) {
        var complete_property = parts.shift();
        var property_parts = complete_property.split(".");
        if (property_parts.length === 1) {
            property_parts.unshift("*");
        }
        var module_name = property_parts.shift();
        var modules = [];
        if (module_name !== "*") {
            var module = modules_by_name[module_name];
            if (module === undefined) {
                respond("not a module: " + module_name);
                return;
            }
            modules.push([module_name, module]);
        } else {
            for (var module_name in modules_by_name) {
                modules.push([module_name, modules_by_name[module_name]]);
            }
        }
        var property_name = property_parts.shift();

        var property_value_string = parts.shift();
        if (property_value_string === undefined) {
            property_value_string = "true";
        }
        var property_value = property_value_string_to_actual_value[property_value_string];
        if (property_value === undefined) {
            // try parsing it as an integer
            property_value = parseInt(property_value_string);
            if (isNaN(property_value)) {
                respond("don't understand value: " + property_value_string);
                return;
            }
        }

        var did_anything = false;
        for (var i = 0; i < modules.length; i++) {
            module_name = modules[i][0];
            module = modules[i][1];
            if (module[property_name] !== undefined) {
                module[property_name] = property_value;
                did_anything = true;
            }
        }
        if (!did_anything) {
            // bad property name
            if (modules.length === 1) {
                respond("module does not have property: " + modules[0][0] + "." + property_name);
                return;
            } else {
                respond("no modules have property: " + property_name);
                return;
            }
        }
        if (!_public.enabled) {
            respond("Warning: disabling my own chat interpretation. nice chatting with you.");
        }
    }
    _public.registerCommand("set", set, 1, 2);

    return _public;
}();

