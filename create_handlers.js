function() {
    var registrar_to_handlers = {};
    var name_to_handlers = {};
    function createEventRegistrar(name) {
        var handlers = [];
        var registrar = function(handler) {
            if (typeof handler !== "function") {
                throw "TypeError";
            }
            handlers.push(handler);
        };
        name_to_handlers[name] = handlers;
        registrar_to_handlers[registrar] = handlers;
        mf[name] = registrar;
    }
    var registrar_names = [
        "onChat",
        "onConnected",
        "onChat",
        "onChunkUpdated",
        "onPositionUpdated",
        "onHealthChanged",
        "onDeath",
        "onMobSpawned",
        "onMobMovement",
        "onSpawn",
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
        var handlers = registrar_to_handlers[registrar];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    return name_to_handlers;
}()
