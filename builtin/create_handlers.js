function() {
    var name_to_handlers = {};
    function createEventRegistrar(name) {
        var handlers = [];
        var registrar = function(handler) {
            if (typeof handler !== "function") {
                throw "TypeError";
            }
            handlers.push(handler);
        };
        registrar._name = name;
        name_to_handlers[name] = handlers;
        mf[name] = registrar;
    }
    var registrar_names = [
        "onConnected",
        "onChat",
        "onChunkUpdated",
        "onSpawn",
        "onSelfMoved",
        "onHealthChanged",
        "onDeath",
        "onEntitySpawned",
        "onEntityDespawned",
        "onEntityMoved",
        "onAnimation",
        "onStoppedDigging",
        "onEquippedItemChanged",
        "onInventoryUpdated",
        "onTimeUpdated",
        "onUserJoined",
        "onUserQuit",
    ];
    for (var i = 0; i < registrar_names.length; i++) {
        createEventRegistrar(registrar_names[i]);
    }
    mf.removeHandler = function(registrar, handler) {
        var handlers = name_to_handlers[registrar._name];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
                return;
            }
        }
        throw "IllegalArgument";
    };
    return name_to_handlers;
}()
