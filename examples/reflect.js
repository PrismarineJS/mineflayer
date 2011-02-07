// reflect mineflayer program: reveals what properties the mf object has.
var global = this;
function MineflayerBot() {
    function reflect(prefix, obj) {
        for (name in obj) {
            child = obj[name];
            mf.debug(prefix + name + "<"+ typeof child + "> = " + child);
            if (typeof obj == 'object' && child !== global) {
                reflect(prefix + name + ".", child);
            }
        }
    }
    reflect("gloabl.", global);
    mf.exit();
}
